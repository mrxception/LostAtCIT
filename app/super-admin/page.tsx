"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin" | "super_admin"
  created_at: string
}

export default function SuperAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/")
    } else if (user && user.role === "super_admin") {
      fetchUsers()
    }
  }, [user, loading, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/super-admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    setUpdatingUserId(userId)
    try {
      const response = await fetch(`/api/super-admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update user role")
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
      alert("Failed to update user role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "super_admin":
        return "status-badge" + " " + "super-admin-badge"
      case "admin":
        return "status-badge status-approved"
      case "user":
        return "status-badge status-pending"
      default:
        return "status-badge"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin"
      case "admin":
        return "Admin"
      case "user":
        return "User"
      default:
        return role
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading super admin panel..." />
      </div>
    )
  }

  if (!user || user.role !== "super_admin") {
    return null // Will redirect
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>Super Admin Panel</h1>

      <div className="card">
        <h2 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>User Management</h2>

        {/* Desktop Table View */}
        <div className="table-responsive desktop-only">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr key={userData.id} className="fade-in">
                  <td>
                    <strong>{userData.name}</strong>
                  </td>
                  <td>{userData.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(userData.role)}>{getRoleDisplayName(userData.role)}</span>
                  </td>
                  <td>
                    {new Date(userData.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="btn-group" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {userData.role !== "user" && (
                        <button
                          onClick={() => handleRoleChange(userData.id, "user")}
                          className="btn btn-sm btn-secondary"
                          disabled={updatingUserId === userData.id}
                        >
                          {updatingUserId === userData.id ? <LoadingSpinner size="sm" /> : "Make User"}
                        </button>
                      )}
                      {userData.role !== "admin" && (
                        <button
                          onClick={() => handleRoleChange(userData.id, "admin")}
                          className="btn btn-sm btn-warning"
                          disabled={updatingUserId === userData.id}
                        >
                          {updatingUserId === userData.id ? <LoadingSpinner size="sm" /> : "Make Admin"}
                        </button>
                      )}
                      {userData.role !== "super_admin" && userData.id !== user.id && (
                        <button
                          onClick={() => handleRoleChange(userData.id, "super_admin")}
                          className="btn btn-sm btn-danger"
                          disabled={updatingUserId === userData.id}
                        >
                          {updatingUserId === userData.id ? <LoadingSpinner size="sm" /> : "Make Super Admin"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only">
          <div className="mobile-users-grid">
            {users.map((userData) => (
              <div key={userData.id} className="mobile-user-card fade-in">
                <div className="mobile-user-header">
                  <div className="mobile-user-info">
                    <h3 className="mobile-user-name">{userData.name}</h3>
                    <p className="mobile-user-email">{userData.email}</p>
                    <div className="mobile-user-meta">
                      <span className={getRoleBadgeClass(userData.role)}>{getRoleDisplayName(userData.role)}</span>
                      <span style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
                        Joined{" "}
                        {new Date(userData.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mobile-user-actions">
                  {userData.role !== "user" && (
                    <button
                      onClick={() => handleRoleChange(userData.id, "user")}
                      className="btn btn-sm btn-secondary"
                      disabled={updatingUserId === userData.id}
                    >
                      {updatingUserId === userData.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        "Make User"
                      )}
                    </button>
                  )}
                  {userData.role !== "admin" && (
                    <button
                      onClick={() => handleRoleChange(userData.id, "admin")}
                      className="btn btn-sm btn-warning"
                      disabled={updatingUserId === userData.id}
                    >
                      {updatingUserId === userData.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        "Make Admin"
                      )}
                    </button>
                  )}
                  {userData.role !== "super_admin" && userData.id !== user.id && (
                    <button
                      onClick={() => handleRoleChange(userData.id, "super_admin")}
                      className="btn btn-sm btn-danger"
                      disabled={updatingUserId === userData.id}
                    >
                      {updatingUserId === userData.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <LoadingSpinner size="sm" />
                        </div>
                      ) : (
                        "Make Super Admin"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {users.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "var(--gray-600)" }}>No users found.</p>
          </div>
        )}
      </div>
    </main>
  )
}
