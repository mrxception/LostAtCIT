"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Item {
  id: number
  name: string
  type: "lost" | "found"
  category: string
  location: string
  description: string
  date_lost_found: string
  contact_info?: string
  image_path?: string
  user_id: number
  user_name: string
  user_email: string
  created_at: string
}

export default function ItemPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [message, setMessage] = useState("")
  const [messageSent, setMessageSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
      } else if (response.status === 404) {
        router.push("/search")
      }
    } catch (error) {
      console.error("Failed to fetch item:", error)
      router.push("/search")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !item || !message.trim()) return

    setSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: item.user_id,
          item_id: item.id,
          content: message.trim(),
        }),
      })

      if (response.ok) {
        setMessageSent(true)
        setMessage("")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading item details..." />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container" style={{ marginTop: "2rem", textAlign: "center" }}>
        <h1>Item not found</h1>
        <Link href="/search" className="btn btn-primary">
          Back to Search
        </Link>
      </div>
    )
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/search" style={{ color: "var(--primary-blue)", textDecoration: "none" }}>
          ← Back to Search
        </Link>
      </div>

      <div className="grid grid-2" style={{ gap: "3rem" }}>
        <div className="fade-in">
          {item.image_path ? (
            <img
              src={item.image_path || "/placeholder.svg"}
              alt="Item Image"
              style={{
                width: "100%",
                borderRadius: "1rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "300px",
                backgroundColor: "var(--gray-100)",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gray-600)",
                fontSize: "1.2rem",
              }}
            >
              No Image Available
            </div>
          )}
        </div>

        <div className="card slide-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
            <h1 style={{ color: "var(--primary-blue)", margin: 0 }}>{item.name}</h1>
            <span className={`status-badge status-${item.type}`}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <strong style={{ color: "var(--gray-800)" }}>Category:</strong>
                <p style={{ margin: "0.25rem 0", color: "var(--gray-600)" }}>{item.category}</p>
              </div>
              <div>
                <strong style={{ color: "var(--gray-800)" }}>Date:</strong>
                <p style={{ margin: "0.25rem 0", color: "var(--gray-600)" }}>
                  {new Date(item.date_lost_found).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <strong style={{ color: "var(--gray-800)" }}>Location:</strong>
              <p style={{ margin: "0.25rem 0", color: "var(--gray-600)" }}>{item.location}</p>
            </div>

            <div>
              <strong style={{ color: "var(--gray-800)" }}>Description:</strong>
              <p style={{ margin: "0.25rem 0", color: "var(--gray-600)", lineHeight: 1.6 }}>
                {item.description.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < item.description.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {item.contact_info && (
            <div
              style={{
                backgroundColor: "var(--light-maroon)",
                border: "2px solid var(--primary-maroon)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                margin: "1.5rem 0",
              }}
            >
              <div
                style={{
                  color: "var(--primary-maroon)",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📞 Contact Information
              </div>
              <div
                style={{
                  color: "var(--gray-800)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {item.contact_info}
              </div>
              <div
                style={{
                  color: "var(--gray-600)",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                You can contact the poster directly using the information above.
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem" }}>
            <p style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>
              Posted by <strong>{item.user_name}</strong> on{" "}
              {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {user && user.id !== item.user_id ? (
              <>
                {messageSent && (
                  <div className="alert alert-success">
                    Message sent successfully! You can view your messages in the{" "}
                    <Link href="/messages" style={{ color: "var(--primary-blue)" }}>
                      Messages
                    </Link>{" "}
                    section.
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={{ marginTop: "1rem" }}>
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Contact the owner:
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="form-textarea"
                      required
                      placeholder="Hi, I think this might be my item..."
                      disabled={sending}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={sending || !message.trim()}>
                    {sending ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <LoadingSpinner size="sm" />
                        Sending...
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </>
            ) : !user ? (
              <div className="alert alert-warning">
                <Link href="/login" style={{ color: "var(--primary-blue)" }}>
                  Login
                </Link>{" "}
                to contact the owner of this item.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
