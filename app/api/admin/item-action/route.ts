import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/middleware"
import { query } from "@/lib/database"

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const { item_id, action } = await request.json()

    if (!item_id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "approve") {
      await query("UPDATE items SET status = 'approved' WHERE id = ?", [item_id])
    } else if (action === "reject") {
      await query("DELETE FROM items WHERE id = ?", [item_id])
    } else if (action === "mark_returned") {
      await query("UPDATE items SET status = 'returned' WHERE id = ?", [item_id])
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin action error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
})
