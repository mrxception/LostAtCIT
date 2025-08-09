import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const POST = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      type,
      location,
      date_lost_found,
      contact_info,
      image_path,
      cloudinary_public_id,
    } = body

    if (!name || !description || !category || !type || !location || !date_lost_found) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO items (user_id, name, description, category, type, location, date_lost_found, contact_info, image_path, cloudinary_public_id, status, date_reported) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURDATE())`,
      [
        user.id,
        name,
        description,
        category,
        type,
        location,
        date_lost_found,
        contact_info || null,
        image_path || null,
        cloudinary_public_id || null,
      ],
    )

    return NextResponse.json({ success: true, id: (result as any).insertId })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
})
