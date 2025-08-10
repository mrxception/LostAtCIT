"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface AdminStats {
  total_items: number
  pending_items: number
  approved_items: number
  returned_items: number
}

interface PendingItem {
  id: number
  name: string
  type: "lost" | "found"
  category: string
  description: string
  location: string
  image_path?: string
  user_name: string
  created_at: string
}

interface ApprovedItem {
  id: number
  name: string
  type: "lost" | "found"
  date_lost_found: string
  image_path?: string
  user_name: string
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    total_items: 0,
    pending_items: 0,
    approved_items: 0,
    returned_items: 0,
  })
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [approvedItems, setApprovedItems] = useState<ApprovedItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.push("/");
    } else if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router])

  const fetchAdminData = async () => {
    try {
      const [statsRes, pendingRes, approvedRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/pending-items"),
        fetch("/api/admin/approved-items"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingItems(pendingData)
      }

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json()
        setApprovedItems(approvedData)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleItemAction = async (itemId: number, action: "approve" | "reject" | "mark_returned") => {
    const confirmMessage =
      action === "reject"
        ? "Are you sure you want to reject this item?"
        : action === "mark_returned"
          ? "Mark this item as returned?"
          : "Approve this item?"

    if (!confirm(confirmMessage)) return

    setActionLoading(itemId)
    try {
      const response = await fetch("/api/admin/item-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, action }),
      })

      if (response.ok) {
        fetchAdminData()
      }
    } catch (error) {
      console.error("Failed to perform action:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading admin panel..." />
      </div>
    )
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>Admin Panel</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
        <div className="stats" style={{ maxWidth: "800px", width: "100%" }}>
          <div className="stat-item">
            <span className="stat-number">{stats.total_items || 0}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.pending_items || 0}</span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.approved_items || 0}</span>
            <span className="stat-label">Approved Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.returned_items || 0}</span>
            <span className="stat-label">Items Returned</span>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: "4rem" }}>
        <h2 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>Pending Items ({pendingItems.length})</h2>

        {pendingItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--gray-600)" }}>No pending items to review.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {pendingItems.map((item) => (
              <div key={item.id} className="item-card">
                {item.image_path ? (
                  <img src={item.image_path || "/placeholder.svg"} alt="Item Image" className="item-image" />
                ) : (
                  <div className="item-image-placeholder">No Image</div>
                )}
                <div className="item-content">
                  <h3 className="item-title">{item.name}</h3>
                  <div className="item-meta">
                    <span className={`status-badge status-${item.type}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span className="status-badge status-pending">Pending</span>
                  </div>
                  <p style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
                    <strong>Posted by:</strong> {item.user_name}
                  </p>
                  <p style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
                    <strong>Category:</strong> {item.category}
                  </p>
                  <p style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>
                    {item.description.length > 100 ? item.description.substring(0, 100) + "..." : item.description}
                  </p>
                  <div className="btn-group" style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleItemAction(item.id, "approve")}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      disabled={actionLoading === item.id}
                    >
                      {actionLoading === item.id ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      onClick={() => handleItemAction(item.id, "reject")}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                      disabled={actionLoading === item.id}
                    >
                      {actionLoading === item.id ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>
          Approved Items ({approvedItems.length})
        </h2>

        {approvedItems.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--gray-600)" }}>No approved items.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {approvedItems.map((item) => (
              <div key={item.id} className="item-card">
                {item.image_path ? (
                  <img src={item.image_path || "/placeholder.svg"} alt="Item Image" className="item-image" />
                ) : (
                  <div className="item-image-placeholder">No Image</div>
                )}
                <div className="item-content">
                  <h3 className="item-title">{item.name}</h3>
                  <div className="item-meta">
                    <span className={`status-badge status-${item.type}`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                    <span>
                      {new Date(item.date_lost_found).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p style={{ color: "var(--gray-600)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                    By {item.user_name}
                  </p>
                  <button
                    onClick={() => handleItemAction(item.id, "mark_returned")}
                    className="btn btn-warning"
                    style={{ width: "100%" }}
                    disabled={actionLoading === item.id}
                  >
                    {actionLoading === item.id ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </div>
                    ) : (
                      "Mark as Returned"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
