import { openai } from '@ai-sdk/openai';

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
    
    // Get the message from either format
    let message = '';
    
    if (body.message) {
      // If message is directly provided
      message = body.message;
    } else if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      // Extract from messages array if available
      const lastMessage = body.messages[body.messages.length - 1];
      message = lastMessage.content || lastMessage.text || '';
    } else {
      // Fallback for empty request
      console.error("No valid message found in request");
      throw new Error('No message provided');
    }

    // Forward message to FastAPI with the correct schema
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

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