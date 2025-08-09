import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const results = await query(
      `
      SELECT * FROM items 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `,
      [user.id],
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("User items error:", error)
    return NextResponse.json({ error: "Failed to fetch user items" }, { status: 500 })
  }
})
