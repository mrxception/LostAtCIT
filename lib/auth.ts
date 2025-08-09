import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "JYT-ON-TOP"

export interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const results = (await query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [id])) as any[]

  return results.length > 0 ? results[0] : null
}

export async function getUserByEmail(email: string): Promise<any | null> {
  const results = (await query("SELECT * FROM users WHERE email = ?", [email])) as any[]

  return results.length > 0 ? results[0] : null
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password)

  const result = (await query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name,
    email,
    hashedPassword,
  ])) as any

  const newUser = await getUserById(result.insertId)
  if (!newUser) {
    throw new Error("Failed to create user")
  }

  return newUser
}
