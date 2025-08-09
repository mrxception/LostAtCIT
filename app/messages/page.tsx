"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Conversation {
  item_id: number
  item_name: string
  item_type: "lost" | "found"
  message_count: number
  last_message_time: string
  unread_count: number
  item_owner_name: string
  other_participant_name?: string
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  timestamp: string
  sender_name: string
  receiver_name: string
}

interface ItemDetails {
  id: number
  name: string
  type: "lost" | "found"
  user_id: number
  owner_name: string
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedItemId = searchParams.get("item_id")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchConversations()
    }
  }, [user, loading, router])

  useEffect(() => {
    if (selectedItemId && user) {
      fetchMessages(Number.parseInt(selectedItemId))
      markAsRead(Number.parseInt(selectedItemId))
    }
  }, [selectedItemId, user])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const fetchMessages = async (itemId: number) => {
    setMessagesLoading(true)
    try {
      const [messagesRes, itemRes] = await Promise.all([
        fetch(`/api/messages/conversation/${itemId}`),
        fetch(`/api/messages/item-details/${itemId}`),
      ])

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData)
      }

      if (itemRes.ok) {
        const itemData = await itemRes.json()
        setItemDetails(itemData)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const markAsRead = async (itemId: number) => {
    try {
      await fetch(`/api/messages/mark-read/${itemId}`, { method: "POST" })
      fetchConversations() // Refresh to update unread counts
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !itemDetails || !replyContent.trim() || !selectedItemId) return

    setSending(true)
    try {
      // Find the other participant in the conversation
      const otherParticipants = messages
        .map((msg) => (msg.sender_id === user.id ? msg.receiver_id : msg.sender_id))
        .filter((id) => id !== user.id)

      // Get the most recent other participant, or fall back to item owner
      const receiverId =
        otherParticipants.length > 0 ? otherParticipants[otherParticipants.length - 1] : itemDetails.user_id

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          item_id: Number.parseInt(selectedItemId),
          content: replyContent.trim(),
        }),
      })

      if (response.ok) {
        setReplyContent("")
        fetchMessages(Number.parseInt(selectedItemId))
        fetchConversations()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading messages..." />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>Messages</h1>

      <div className="conversations-container">
        <div className="conversation-list">
          <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Conversations</h3>

          {conversations.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--gray-600)" }}>No conversations yet.</p>
              <p style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>Start by messaging someone about an item!</p>
              <Link href="/search" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Browse Items
              </Link>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.item_id}
                className={`conversation-item ${selectedItemId == conversation.item_id.toString() ? "active" : ""}`}
              >
                <Link
                  href={`/messages?item_id=${conversation.item_id}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div className="conversation-header">
                    <span style={{ fontWeight: 600, color: "var(--primary-maroon)" }}>{conversation.item_name}</span>
                    {conversation.unread_count > 0 && <span className="unread-badge">{conversation.unread_count}</span>}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--gray-700)", marginBottom: "0.5rem" }}>
                    {conversation.other_participant_name
                      ? `Chat with ${conversation.other_participant_name}`
                      : `Item by ${conversation.item_owner_name}`}
                  </div>
                  <div className="conversation-meta">
                    <span className={`status-badge status-${conversation.item_type}`}>
                      {conversation.item_type.charAt(0).toUpperCase() + conversation.item_type.slice(1)}
                    </span>
                    <span>
                      {conversation.message_count} message{conversation.message_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--gray-600)", marginTop: "0.5rem" }}>
                    Last activity:{" "}
                    {new Date(conversation.last_message_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="conversation-messages">
          {selectedItemId && itemDetails ? (
            <>
              <div className="card" style={{ marginBottom: "2rem", backgroundColor: "var(--light-maroon)" }}>
                <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>{itemDetails.name}</h3>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  <span className={`status-badge status-${itemDetails.type}`}>
                    {itemDetails.type.charAt(0).toUpperCase() + itemDetails.type.slice(1)}
                  </span>
                  <span style={{ color: "var(--gray-600)" }}>
                    Posted by: <strong>{itemDetails.owner_name}</strong>
                  </span>
                </div>
                <Link href={`/item/${itemDetails.id}`} className="btn btn-secondary btn-sm">
                  View Item Details
                </Link>
              </div>

              <div className="message-list">
                {messagesLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <LoadingSpinner size="md" text="Loading messages..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: "var(--gray-600)" }}>No messages in this conversation yet.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-item ${message.sender_id === user.id ? "outgoing" : "incoming"}`}
                    >
                      <div className="message-header">
                        <strong style={{ color: "var(--primary-maroon)" }}>{message.sender_name}</strong>
                        <span className="message-meta">
                          {new Date(message.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="message-content">
                        {message.content.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < message.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="reply-form">
                <h4 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Send Reply</h4>
                <form onSubmit={handleSendReply}>
                  <div className="form-group">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="reply-textarea"
                      required
                      placeholder="Type your message here..."
                      disabled={sending}
                    />
                  </div>

                  <div className="reply-actions">
                    <button type="submit" className="btn btn-primary" disabled={sending || !replyContent.trim()}>
                      {sending ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <LoadingSpinner size="sm" />
                          Sending...
                        </div>
                      ) : (
                        "Send Reply"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="conversation-empty">
              <h3 style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>Select a Conversation</h3>
              <p style={{ color: "var(--gray-600)" }}>
                Choose a conversation from the list to view and reply to messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
