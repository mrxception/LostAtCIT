import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { params, user }: any) => {
  try {
    const itemId = Number.parseInt(params.itemId)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const results = await query(
      `
      SELECT 
        m.*,
        sender.name as sender_name,
        receiver.name as receiver_name
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.item_id = ? AND (m.sender_id = ? OR m.receiver_id = ?)
      ORDER BY m.timestamp ASC
    `,
      [itemId, user.id, user.id],
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Conversation messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
})
