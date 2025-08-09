import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const results = (await query("SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0", [
      user.id,
    ])) as any[]

    const count = results[0]?.count || 0
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Unread count error:", error)
    return NextResponse.json({ error: "Failed to fetch unread count" }, { status: 500 })
  }
})
