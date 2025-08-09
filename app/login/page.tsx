"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (user) {
    return null 
  }

  return (
    <main
      className="container auth-container"
      style={{ marginTop: "2rem", marginBottom: "2rem", paddingTop: "1rem", paddingBottom: "2rem" }}
    >
      <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
        <div className="card fade-in">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ color: "var(--primary-maroon)", marginBottom: "0.5rem" }}>Welcome Back</h2>
            <p style={{ color: "var(--gray-600)" }}>Login to your CIT E-Lost & Found account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                className="form-input"
                required
                disabled={isSubmitting}
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                className="form-input"
                required
                disabled={isSubmitting}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
              {isSubmitting ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <LoadingSpinner size="sm" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--gray-600)" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "var(--primary-maroon)", fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
