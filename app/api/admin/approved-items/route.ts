import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAdmin(async () => {
  try {
    const results = await query(`
      SELECT i.*, u.name as user_name 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.status = 'approved' 
      ORDER BY i.created_at DESC
    `)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Approved items error:", error)
    return NextResponse.json({ error: "Failed to fetch approved items" }, { status: 500 })
  }
})
