/**
 * Example frontend usage of the Cogni API with generated TypeScript types
 */

import type { ChatMessage } from './chat_message';
import type { ChatResponse } from './chat_response';

/**
 * Send a message to the Cogni API
 */
async function sendMessage(message: string): Promise<ReadableStream> {
  // Create a request object using the ChatMessage type
  const request: ChatMessage = {
    message: message
  };

  // Send the request to the API
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });

  // Check if the response is successful
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // Return the streaming response
  return response.body!;
}

/**
 * Process a streaming response from the Cogni API
 */
async function processStreamingResponse(stream: ReadableStream): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('Stream complete');
        break;
      }
      
      // Decode the chunk and append to UI
      const chunk = decoder.decode(value);
      console.log('Received chunk:', chunk);
      
      // In a real application, you would update the UI here
      // updateChatUI(chunk);
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Example usage in an async function
 */
async function exampleUsage() {
  try {
    // Send a message to the API
    const stream = await sendMessage('What is CogniDAO?');
    
    // Process the streaming response
    await processStreamingResponse(stream);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the example function
// exampleUsage();

export { sendMessage, processStreamingResponse }; 