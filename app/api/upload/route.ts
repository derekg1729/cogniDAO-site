import { writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import path from "path";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "text/plain";
    const filename = `${nanoid()}.${contentType.split("/")[1]}`;
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);
    
    // Create uploads directory if it doesn't exist
    await import("fs").then(fs => 
      fs.promises.mkdir(uploadDir, { recursive: true })
    );
    
    // Get buffer from request body
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file
    await writeFile(filePath, buffer);
    
    // Return the URL
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response("Error uploading file", {
      status: 500,
    });
  }
}
