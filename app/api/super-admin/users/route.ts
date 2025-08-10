import { NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireSuperAdmin(async () => {
  try {
    const results = await query(`
      SELECT id, name, email, role, created_at
      FROM users 
      ORDER BY created_at DESC
    `)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})
