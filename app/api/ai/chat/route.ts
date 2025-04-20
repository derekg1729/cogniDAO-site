// import { openai } from '@ai-sdk/openai';
import type { ChatRequest } from '@/schemas/chatrequest';
import { createChatRequest, validateChatRequest } from '@/utils/validateInput';

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
    
    // Parse the JSON manually with error handling
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("JSON parse error:", e);
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    // Create a validated ChatRequest object
    let requestBody: ChatRequest;
    
    // Check if the body already matches the ChatRequest format
    if (body.message && typeof body.message === 'string') {
      try {
        // Validate and create using utility function
        requestBody = createChatRequest(body.message, { stream: body.stream });
      } catch (e) {
        console.error("Validation error:", e);
        return Response.json({ error: 'Invalid request format' }, { status: 400 });
      }
    } else if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      // Extract from messages array format
      const lastMessage = body.messages[body.messages.length - 1];
      const messageText = lastMessage.content || lastMessage.text || '';
      
      if (!messageText) {
        return Response.json({ error: 'No message content found' }, { status: 400 });
      }
      
      try {
        // Validate and create using utility function
        requestBody = createChatRequest(messageText, { stream: body.stream });
      } catch (e) {
        console.error("Validation error:", e);
        return Response.json({ error: 'Invalid request format' }, { status: 400 });
      }
    } else {
      // No valid format found
      console.error("No valid message found in request");
      return Response.json({ error: 'No message provided' }, { status: 400 });
    }

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
        body: JSON.stringify({ message: requestBody.message }),
      });
    } catch (error) {
      console.log("Error connecting to FastAPI backend, using fallback response");
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
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return Response.json({ error: 'An error occurred', details: String(error) }, { status: 500 });
  }
}