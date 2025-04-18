import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";

export async function GET() {
  try {
    // Test MongoDB native client connection
    await connectToDatabase();
    
    // Test Mongoose connection
    const connectionStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful",
      mongoose: {
        status: connectionStatus
      }
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "MongoDB connection failed", 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 