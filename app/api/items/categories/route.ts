import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const results = (await query(`
      SELECT DISTINCT category 
      FROM items 
      WHERE status = 'approved' 
      ORDER BY category
    `)) as any[]

    const categories = results.map((row) => row.category)
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
