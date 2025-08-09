"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface UserItem {
  id: number
  name: string
  type: "lost" | "found"
  category: string
  status: "pending" | "approved" | "returned"
  location: string
  image_path?: string
  created_at: string
}

interface UserStats {
  total_items: number
  lost_items: number
  found_items: number
  pending_items: number
  approved_items: number
  returned_items: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [stats, setStats] = useState<UserStats>({
    total_items: 0,
    lost_items: 0,
    found_items: 0,
    pending_items: 0,
    approved_items: 0,
    returned_items: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      fetchUserData()
    }
  }, [user, loading, router])

  const fetchUserData = async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([fetch("/api/user/items"), fetch("/api/user/stats")])

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setUserItems(itemsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return
    }

    setDeletingId(itemId)
    try {
      const response = await fetch(`/api/user/items/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        
        await fetchUserData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to delete item")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete item")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading || !user) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <div
        className="dashboard-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}
      >
        <h1 style={{ color: "var(--primary-maroon)", margin: 0 }}>Dashboard</h1>
        <Link href="/report" className="btn btn-primary">
          Report New Item
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
        <div className="grid grid-4" style={{ gap: "1.5rem", maxWidth: "800px", width: "100%" }}>
          <div className="stat-card fade-in" style={{ textAlign: "center" }}>
            <div className="stat-number">{stats.total_items || 0}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card fade-in" style={{ textAlign: "center" }}>
            <div className="stat-number">{stats.lost_items || 0}</div>
            <div className="stat-label">Lost Items</div>
          </div>
          <div className="stat-card fade-in" style={{ textAlign: "center" }}>
            <div className="stat-number">{stats.found_items || 0}</div>
            <div className="stat-label">Found Items</div>
          </div>
          <div className="stat-card fade-in" style={{ textAlign: "center" }}>
            <div className="stat-number">{stats.returned_items || 0}</div>
            <div className="stat-label">Items Returned</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ color: "var(--primary-maroon)", marginBottom: "1.5rem" }}>Your Items</h2>

        {dataLoading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <LoadingSpinner size="lg" text="Loading your items..." />
          </div>
        ) : userItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <h3 style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>No items reported yet</h3>
            <p style={{ color: "var(--gray-600)", marginBottom: "2rem" }}>Start by reporting a lost or found item.</p>
            <Link href="/report" className="btn btn-primary">
              Report Your First Item
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userItems.map((item) => (
                    <tr key={item.id} className="fade-in">
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          {item.image_path ? (
                            <img
                              src={item.image_path || "/placeholder.svg"}
                              alt="Item"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "0.5rem",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: "var(--gray-200)",
                                borderRadius: "0.5rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                color: "var(--gray-600)",
                              }}
                            >
                              No Image
                            </div>
                          )}
                          <div>
                            <strong>{item.name}</strong>
                            <br />
                            <small style={{ color: "var(--gray-600)" }}>{item.location}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${item.type}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="btn-group" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {item.status === "approved" && (
                            <Link href={`/item/${item.id}`} className="btn btn-sm btn-secondary">
                              View
                            </Link>
                          )}
                          <Link href={`/edit-item/${item.id}`} className="btn btn-sm btn-primary">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn btn-sm btn-danger"
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <LoadingSpinner size="sm" />
                              </div>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-only">
              <div className="mobile-items-grid">
                {userItems.map((item) => (
                  <div key={item.id} className="mobile-item-card fade-in">
                    <div className="mobile-item-header">
                      {item.image_path ? (
                        <img src={item.image_path || "/placeholder.svg"} alt="Item" className="mobile-item-image" />
                      ) : (
                        <div className="mobile-item-image-placeholder">No Image</div>
                      )}
                      <div className="mobile-item-info">
                        <h3 className="mobile-item-title">{item.name}</h3>
                        <p className="mobile-item-location">{item.location}</p>
                        <div className="mobile-item-badges">
                          <span className={`status-badge status-${item.type}`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mobile-item-details">
                      <div className="mobile-item-meta">
                        <span>
                          <strong>Category:</strong> {item.category}
                        </span>
                        <span>
                          <strong>Date:</strong>{" "}
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mobile-item-actions">
                      {item.status === "approved" && (
                        <Link href={`/item/${item.id}`} className="btn btn-sm btn-secondary">
                          View
                        </Link>
                      )}
                      <Link href={`/edit-item/${item.id}`} className="btn btn-sm btn-primary">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn btn-sm btn-danger"
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <LoadingSpinner size="sm" />
                          </div>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
