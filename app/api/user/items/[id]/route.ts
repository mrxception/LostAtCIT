import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

export const GET = requireAuth(async (request: NextRequest, { params, user }: any) => {
  try {
    const itemId = Number.parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const results = (await query("SELECT * FROM items WHERE id = ? AND user_id = ?", [itemId, user.id])) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("Get user item error:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
})

export const PUT = requireAuth(async (request: NextRequest, { params, user }: any) => {
  try {
    const itemId = Number.parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    
    const existingItems = (await query("SELECT * FROM items WHERE id = ? AND user_id = ?", [itemId, user.id])) as any[]

    if (existingItems.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const existingItem = existingItems[0]
    const formData = await request.formData()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const type = formData.get("type") as string
    const location = formData.get("location") as string
    const date_lost_found = formData.get("date_lost_found") as string
    const contact_info = formData.get("contact_info") as string
    const image = formData.get("image") as File | null
    const removeImage = formData.get("remove_image") === "1"

    if (!name || !description || !category || !type || !location || !date_lost_found) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let imagePath = existingItem.image_path

    
    if (removeImage && existingItem.image_path) {
      try {
        const oldImagePath = join(process.cwd(), "public", existingItem.image_path)
        await unlink(oldImagePath)
      } catch (error) {
        
      }
      imagePath = null
    }

    
    if (image && image.size > 0) {
      
      if (existingItem.image_path) {
        try {
          const oldImagePath = join(process.cwd(), "public", existingItem.image_path)
          await unlink(oldImagePath)
        } catch (error) {
          
        }
      }

      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      
      const uploadsDir = join(process.cwd(), "public", "uploads")
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        
      }

      
      const filename = `${Date.now()}-${image.name}`
      const filepath = join(uploadsDir, filename)

      await writeFile(filepath, buffer)
      imagePath = `/uploads/${filename}`
    }

    await query(
      `UPDATE items SET name = ?, description = ?, category = ?, type = ?, location = ?, date_lost_found = ?, contact_info = ?, image_path = ?, status = 'pending' 
       WHERE id = ? AND user_id = ?`,
      [name, description, category, type, location, date_lost_found, contact_info || null, imagePath, itemId, user.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
})

export const DELETE = requireAuth(async (request: NextRequest, { params, user }: any) => {
  try {
    const itemId = Number.parseInt(params.id)
    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    
    const items = (await query("SELECT * FROM items WHERE id = ? AND user_id = ?", [itemId, user.id])) as any[]

    if (items.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const item = items[0]

    
    await query("DELETE FROM messages WHERE item_id = ?", [itemId])

    
    if (item.image_path) {
      try {
        const imagePath = join(process.cwd(), "public", item.image_path)
        await unlink(imagePath)
      } catch (error) {
        
      }
    }

    
    await query("DELETE FROM items WHERE id = ? AND user_id = ?", [itemId, user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
})
