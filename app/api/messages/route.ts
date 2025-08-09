import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const POST = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const { receiver_id, item_id, content, parent_id } = await request.json()

    if (!receiver_id || !item_id || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await query(
      `
      INSERT INTO messages (sender_id, receiver_id, item_id, parent_id, content, timestamp, is_read) 
      VALUES (?, ?, ?, ?, ?, NOW(), 0)
    `,
      [user.id, receiver_id, item_id, parent_id || null, content.trim()],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
})
