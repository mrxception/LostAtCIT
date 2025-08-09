import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const results = (await query(`
      SELECT i.*, u.name as user_name 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.status = 'approved' 
      ORDER BY i.created_at DESC 
      LIMIT 6
    `)) as any[]

    return NextResponse.json(results)
  } catch (error) {
    console.error("Recent items error:", error)
    return NextResponse.json({ error: "Failed to fetch recent items" }, { status: 500 })
  }
}
