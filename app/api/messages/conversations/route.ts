import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { query } from "@/lib/database"

export const GET = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const results = await query(
      `
      SELECT 
        m.item_id,
        i.name as item_name,
        i.type as item_type,
        i.user_id as item_owner_id,
        owner.name as item_owner_name,
        COUNT(m.id) as message_count,
        MAX(m.timestamp) as last_message_time,
        SUM(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count,
        (SELECT u.name FROM users u 
         JOIN messages m2 ON (m2.sender_id = u.id OR m2.receiver_id = u.id) 
         WHERE m2.item_id = m.item_id AND u.id != ? AND m2.timestamp = MAX(m.timestamp)
         LIMIT 1) as other_participant_name
      FROM messages m
      JOIN items i ON m.item_id = i.id
      JOIN users owner ON i.user_id = owner.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY m.item_id, i.name, i.type, i.user_id, owner.name
      ORDER BY last_message_time DESC
    `,
      [user.id, user.id, user.id, user.id],
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error("Conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
})
