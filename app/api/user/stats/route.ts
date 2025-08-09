import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const results = (await query(
      `
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost_items,
        SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found_items,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_items,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_items,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_items
      FROM items WHERE user_id = ?
    `,
      [user.id],
    )) as any[]

    const stats = results[0] || {
      total_items: 0,
      lost_items: 0,
      found_items: 0,
      pending_items: 0,
      approved_items: 0,
      returned_items: 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
  }
})
