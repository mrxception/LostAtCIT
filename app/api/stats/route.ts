import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const results = (await query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost_items,
        SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found_items,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_items
      FROM items WHERE status IN ('approved', 'returned')
    `)) as any[]

    const stats = results[0] || {
      total_items: 0,
      lost_items: 0,
      found_items: 0,
      returned_items: 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
