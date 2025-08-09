import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const results = (await query(`
      SELECT DISTINCT location 
      FROM items 
      WHERE status = 'approved' AND location IS NOT NULL 
      ORDER BY location
    `)) as any[]

    const locations = results.map((row) => row.location)
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Locations error:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
