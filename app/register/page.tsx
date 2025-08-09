"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function RegisterPage() {
  const { user, register, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required")
      return false
    }

    if (formData.name.trim().length < 2) {
      setError("Full name must be at least 2 characters")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email address is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.password) {
      setError("Password is required")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Attempting registration...")
      const result = await register(formData.name.trim(), formData.email.trim(), formData.password)

      if (result.success) {
        setSuccess("Registration successful! Redirecting to dashboard...")
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        setError(result.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An unexpected error occurred. Please try again.")
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
            <h2 style={{ color: "var(--primary-maroon)", marginBottom: "0.5rem" }}>Join CIT E-Lost & Found</h2>
            <p style={{ color: "var(--gray-600)" }}>Create your account to start reporting items</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
              {error.includes("database") && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  <strong>Troubleshooting:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                    <li>Make sure MySQL is running</li>
                    <li>Check your database configuration</li>
                    <li>Run the database setup script</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
                placeholder="Enter your full name"
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Enter your password (min. 6 characters)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                required
                minLength={6}
                disabled={isSubmitting}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isSubmitting}>
              {isSubmitting ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <LoadingSpinner size="sm" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--gray-600)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary-maroon)", fontWeight: 600 }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
