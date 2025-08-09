import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { params }: any) => {
  try {
    const itemId = Number.parseInt(params.itemId)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const results = (await query(
      `
      SELECT i.*, u.name as owner_name 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ?
    `,
      [itemId],
    )) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("Item details error:", error)
    return NextResponse.json({ error: "Failed to fetch item details" }, { status: 500 })
  }
})
