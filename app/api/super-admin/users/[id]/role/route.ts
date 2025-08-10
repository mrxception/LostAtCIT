import { type NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/middleware"
import { query } from "@/lib/database"

export const PUT = requireSuperAdmin(async (request: NextRequest, { params }: any) => {
  try {
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { role } = await request.json()

    if (!role || !["user", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await query("UPDATE users SET role = ? WHERE id = ?", [role, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
})
