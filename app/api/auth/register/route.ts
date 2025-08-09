import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Registration attempt started")

    const body = await request.json()
    console.log("Request body received:", { ...body, password: "[HIDDEN]", confirmPassword: "[HIDDEN]" })

    const { name, email, password, confirmPassword } = body

    
    if (!name || !email || !password) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match")
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format")
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    console.log("Checking if user exists...")
    
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    console.log("Creating new user...")
    
    const user = await createUser(name, email, password)
    console.log("User created successfully:", { id: user.id, email: user.email })

    const token = generateToken(user)
    console.log("Token generated")

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, 
    })

    console.log("Registration completed successfully")
    return response
  } catch (error) {
    console.error("Registration error:", error)

    
    if (error instanceof Error) {
      console.log("Error message:", error.message)
      console.log("Error stack:", error.stack)

      if (error.message.includes("Duplicate entry") || error.message.includes("ER_DUP_ENTRY")) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
      if (error.message.includes("ER_NO_SUCH_TABLE")) {
        return NextResponse.json(
          { error: "Database not properly configured. Please run the setup script." },
          { status: 500 },
        )
      }
      if (error.message.includes("ER_BAD_DB_ERROR")) {
        return NextResponse.json(
          { error: "Database connection failed. Please check your database configuration." },
          { status: 500 },
        )
      }
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Cannot connect to database. Please ensure MySQL is running." },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Registration failed. Please try again.",
        details: process.env.NODE_ENV === "development" ? "ERRORRR" : undefined,
      },
      { status: 500 },
    )
  }
}
