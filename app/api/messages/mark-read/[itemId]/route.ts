import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const POST = requireAuth(async (request: NextRequest, { params, user }: any) => {
  try {
    const itemId = Number.parseInt(params.itemId)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    await query("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND item_id = ? AND is_read = 0", [
      user.id,
      itemId,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark read error:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
})
