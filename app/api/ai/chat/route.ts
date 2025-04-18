import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    console.log("API route called");
    
    const body = await req.json();
    console.log("Received message:", body);
    const message = body

    /* Comment out mock response section
    // For testing purposes, we'll return a mock response
    // In production, you would connect to your FastAPI backend
    const mockResponses = [
      "Hello! How can I help you with CogniDAO today?",
      "CogniDAO is a knowledge collective platform for communally building tools to empower communities.",
      "Our platform allows you to spawn your own AI-powered organization.",
      "You can use CogniDAO to build and manage AI-powered tools for your community.",
      "I'm still learning about CogniDAO. Can you ask something else about our platform?",
    ]

    // Select a random response
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    console.log("Sending mock response:", randomResponse);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ response: randomResponse })
    */

    // For streaming implementation, you would use:
    // - Response.json() with a TransformStream for Server-Sent Events
    // - or a dedicated WebSocket connection

    // Example for non-streaming implementation
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message.message }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from FastAPI")
    }

    const data = await response.json()
    return NextResponse.json({ response: data.response })
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
