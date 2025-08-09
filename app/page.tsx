"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Stats {
  total_items: number
  lost_items: number
  found_items: number
  returned_items: number
}

interface Item {
  id: number
  name: string
  type: "lost" | "found"
  location: string
  description: string
  date_lost_found: string
  image_path?: string
  user_name: string
}

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    total_items: 0,
    lost_items: 0,
    found_items: 0,
    returned_items: 0,
  })
  const [recentItems, setRecentItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, itemsResponse] = await Promise.all([fetch("/api/stats"), fetch("/api/items/recent")])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setRecentItems(itemsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading homepage..." />
      </div>
    )
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>CIT E-Lost & Found</h1>
          <p>
            A Digital Lost and Found Portal for the <strong>Cebu Institute of Technology – University</strong>
          </p>
          <p style={{ color: "var(--primary-maroon)", fontWeight: 600, marginBottom: "2rem" }}>
            Connecting our CIT-U community through lost and found items
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/search" className="btn btn-primary">
              Search Items
            </Link>
            {user ? (
              <Link href="/report" className="btn btn-secondary">
                Report Item
              </Link>
            ) : (
              <Link href="/register" className="btn btn-secondary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "center", margin: "3rem 0" }}>
          <div className="stats" style={{ maxWidth: "800px", width: "100%" }}>
            <div className="stat-item fade-in">
              <span className="stat-number">{stats.total_items || 0}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-item fade-in">
              <span className="stat-number">{stats.lost_items || 0}</span>
              <span className="stat-label">Lost Items</span>
            </div>
            <div className="stat-item fade-in">
              <span className="stat-number">{stats.found_items || 0}</span>
              <span className="stat-label">Found Items</span>
            </div>
            <div className="stat-item fade-in">
              <span className="stat-number">{stats.returned_items || 0}</span>
              <span className="stat-label">Items Returned</span>
            </div>
          </div>
        </div>

        {recentItems.length > 0 ? (
          <section style={{ margin: "4rem 0" }}>
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary-maroon)" }}>Recent Posts</h2>
            <div className="grid grid-3">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="item-card fade-in"
                  onClick={() => (window.location.href = `/item/${item.id}`)}
                >
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
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
                      <strong>Location:</strong> {item.location}
                    </p>
                    <p style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>
                      {item.description.length > 100 ? item.description.substring(0, 100) + "..." : item.description}
                    </p>
                    <Link href={`/item/${item.id}`} className="btn btn-primary" style={{ width: "100%" }}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/search" className="btn btn-secondary">
                View All Items
              </Link>
            </div>
          </section>
        ) : (
          <section style={{ margin: "4rem 0" }}>
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <h3 style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>No Items Posted Yet</h3>
              <p style={{ color: "var(--gray-600)", marginBottom: "2rem" }}>
                Be the first to help the CIT-U community by reporting a lost or found item!
              </p>
              {user ? (
                <Link href="/report" className="btn btn-primary">
                  Report Your First Item
                </Link>
              ) : (
                <Link href="/register" className="btn btn-primary">
                  Join CIT E-Lost & Found
                </Link>
              )}
            </div>
          </section>
        )}

        <section style={{ margin: "4rem 0" }}>
          <h2 style={{ textAlign: "center", marginBottom: "3rem", color: "var(--primary-maroon)" }}>How It Works</h2>
          <div className="how-it-works-grid">
            <div className="card fade-in" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "var(--light-maroon)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "var(--primary-maroon)",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                1
              </div>
              <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Report Item</h3>
              <p style={{ color: "var(--gray-600)" }}>
                Found something or lost an item? Create an account and report it with details and photos.
              </p>
            </div>
            <div className="card fade-in" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "var(--light-maroon)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "var(--primary-maroon)",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                2
              </div>
              <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Search & Connect</h3>
              <p style={{ color: "var(--gray-600)" }}>
                Browse through posted items and connect with other CIT-U community members.
              </p>
            </div>
            <div className="card fade-in" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "var(--light-maroon)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "var(--primary-maroon)",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                3
              </div>
              <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Reunite Items</h3>
              <p style={{ color: "var(--gray-600)" }}>
                Message item owners to arrange safe return and help reunite items with their owners.
              </p>
            </div>
          </div>
        </section>

        {!user && (
          <section style={{ margin: "4rem 0" }}>
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, var(--light-maroon), var(--light-gold))",
                textAlign: "center",
                padding: "3rem",
              }}
            >
              <h2 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>Join the CIT-U Community</h2>
              <p style={{ color: "var(--gray-600)", marginBottom: "2rem", fontSize: "1.1rem" }}>
                Help your fellow students and staff by joining our digital lost and found community.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/register" className="btn btn-primary">
                  Create Account
                </Link>
                <Link href="/login" className="btn btn-secondary">
                  Login
                </Link>
              </div>
            </div>
          </section>
        )}
      </section>
    </>
  )
}
