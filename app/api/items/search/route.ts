import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const type = searchParams.get("type") || ""
    const location = searchParams.get("location") || ""

    let sql = `
      SELECT i.*, u.name as user_name 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.status = 'approved'
    `
    const params: any[] = []

    if (search) {
      sql += " AND (i.name LIKE ? OR i.description LIKE ?)"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category) {
      sql += " AND i.category = ?"
      params.push(category)
    }

    if (type) {
      sql += " AND i.type = ?"
      params.push(type)
    }

    if (location) {
      sql += " AND i.location LIKE ?"
      params.push(`%${location}%`)
    }

    sql += " ORDER BY i.created_at DESC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search items" }, { status: 500 })
  }
}
