import { NextResponse } from "next/server"
import { testConnection } from "@/lib/database"

export async function GET() {
  try {
    const dbConnected = await testConnection()

    return NextResponse.json({
      status: "ok",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
