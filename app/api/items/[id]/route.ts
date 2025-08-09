import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemId = Number.parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const results = (await query(
      `
      SELECT i.*, u.name as user_name, u.email as user_email 
      FROM items i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ? AND i.status = 'approved'
    `,
      [itemId],
    )) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("Item fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}
