// import { openai } from '@ai-sdk/openai';
import type { ChatRequest } from '@/schemas/chatrequest';
import { createChatRequest, validateChatRequest } from '@/utils/validateInput';
// New imports for the complete request schema and history messages
import type { CompleteQueryRequest } from '@/schemas/completequeryrequest';
import type { HistoryMessage } from '@/schemas/historymessage';

/**
 * Chat API Route
 * 
 * Handles streaming chat requests between the frontend and FastAPI backend.
 * Accepts messages in two formats:
 * 1. { message: string }
 * 2. { messages: Array<{content?: string, text?: string}> }
 * 
 * Forwards requests to FastAPI server and streams responses back to client.
 * Includes error handling for JSON parsing and API communication.
 */

export async function POST(req: Request) {
  try {
    // Parse the request
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    console.log('[Chat API] Received raw body:', rawBody); // Log raw body
    
    // Parse the JSON manually with error handling
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("JSON parse error:", e);
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    console.log('[Chat API] Parsed request body:', body); // Log parsed body

    // Construct the payload for FastAPI based on CompleteQueryRequest schema
    let fastApiPayload: Partial<CompleteQueryRequest> = {};
    let messageHistory: HistoryMessage[] = [];
    let currentMessage: string | undefined;

    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      // If 'messages' array exists, use it for history and extract the last message
      messageHistory = body.messages.slice(0, -1).map((msg: any) => ({
        role: msg.role || 'user', // Assign default role if missing
        content: msg.content || msg.text || '',
      }));
      const lastMessage = body.messages[body.messages.length - 1];
      currentMessage = lastMessage.content || lastMessage.text;

    } else if (body.message && typeof body.message === 'string') {
      // If only 'message' exists, use it as the current message
      currentMessage = body.message;
      // Potentially add logic here if the frontend might send history separately
    }

    if (!currentMessage) {
      console.error("No current message content found in request");
      return Response.json({ error: 'No message provided' }, { status: 400 });
    }

    fastApiPayload = {
      message: currentMessage,
      message_history: messageHistory.length > 0 ? messageHistory : null, // Send null if no history
      // Include other potential fields from body if needed (model, temperature, etc.)
      model: body.model,
      temperature: body.temperature,
      system_message: body.system_message,
      // stream: body.stream // Assuming stream is handled separately or implicitly by FastAPI
    };
    
    // Optional: Add validation using Ajv if needed later
    // const errors = validateCompleteQueryRequest(fastApiPayload); // Assuming such a validator exists
    // if (errors) { ... handle validation errors ... }

    console.log('[Chat API] Sending payload to FastAPI:', JSON.stringify(fastApiPayload, null, 2)); // Log payload being sent

    // Try to connect to FastAPI backend
    let response;
    try {
      const fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8000'; // Fallback for safety
      response = await fetch(`${fastapiUrl}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.COGNI_HOME_API_KEY || 'dev-key'}`
        },
        body: JSON.stringify(fastApiPayload), // Send the complete payload
      });
    } catch (error) {
      console.error(
        `Error connecting to FastAPI backend at ${process.env.FASTAPI_URL}/chat:`, 
        error
      );
      console.log("Using fallback response due to connection error."); // Keep this for clarity
      console.log('[Chat API] Initiating fallback response stream.'); // Log fallback initiation

      // Create a simple text stream for the response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      
      // Simulate a streaming response with a simple message
      (async () => {
        const encoder = new TextEncoder();
        const fallbackResponses = [
          "I'm sorry, but I'm currently unable to connect to my knowledge base. ",
          "This is a fallback response. ",
          "In normal operation, I would be able to provide more accurate information about CogniDAO and related topics. ",
          "Please check that the backend service is running or try again later."
        ];
        
        for (const part of fallbackResponses) {
          await writer.write(encoder.encode(part));
          // Add a small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        await writer.close();
      })();
      
      console.log('[Chat API] Returning stream response.'); // Log returning stream

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status}`);
    }
    
    // Stream the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Read from FastAPI in the background
    (async () => {
      try {
        const streamReader = response.body?.getReader();
        if (!streamReader) {
          console.error("No stream reader available");
          return;
        }
        
        while (true) {
          const { value, done } = await streamReader.read();
          
          if (done) {
            await writer.close();
            break;
          }
          
          await writer.write(value);
        }
      } catch (error) {
        console.error("Error in stream processing:", error);
        writer.abort(error);
      }
    })();
    
    console.log('[Chat API] Returning stream response.'); // Log returning stream

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in API route:", error); // Existing error log
    console.error('[Chat API] Top-level error caught:', error); // Added more context
    return Response.json({ error: 'An error occurred', details: String(error) }, { status: 500 });
  }
}