import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAdmin(async () => {
  try {
    const results = (await query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_items,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_items,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_items
      FROM items
    `)) as any[]

    const stats = results[0] || {
      total_items: 0,
      pending_items: 0,
      approved_items: 0,
      returned_items: 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
})
