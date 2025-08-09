import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "./auth"

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const user = await getUserById(decoded.id)
  return user
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(request, { ...context, user })
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const user = await getAuthUser(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    return handler(request, { ...context, user })
  }
}
