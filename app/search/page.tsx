"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

interface Item {
  id: number
  name: string
  type: "lost" | "found"
  category: string
  location: string
  date_lost_found: string
  image_path?: string
  user_name: string
}

interface SearchFilters {
  search: string
  category: string
  type: string
  location: string
}

export default function SearchPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    category: "",
    type: "",
    location: "",
  })
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchFiltersData()
    fetchItems()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [filters])

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        fetch("/api/items/categories"),
        fetch("/api/items/locations"),
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json()
        setLocations(locationsData)
      }
    } catch (error) {
      console.error("Failed to fetch filter data:", error)
    }
  }

  const fetchItems = async () => {
    if (!loading) setSearching(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/items/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      type: "",
      location: "",
    })
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading search page..." />
      </div>
    )
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem" }}>Search Lost & Found Items</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="search" className="form-label">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="form-input"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Type
            </label>
            <select
              id="type"
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <select
              id="location"
              className="form-select"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div
              className="form-actions"
              style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}
            >
            <button type="button" className="btn btn-primary" onClick={fetchItems} disabled={searching}>
              {searching ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <LoadingSpinner size="sm" />
                  Searching...
                </div>
              ) : (
                "Search"
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      <div className="search-results">
        {searching ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <LoadingSpinner size="lg" text="Searching items..." />
          </div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <h3 style={{ color: "var(--gray-600)", marginBottom: "1rem" }}>No items found</h3>
            <p style={{ color: "var(--gray-600)" }}>
              Try adjusting your search criteria or{" "}
              <Link href="/report" style={{ color: "var(--primary-maroon)" }}>
                report a new item
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-3" style={{ gap: "2rem" }}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="item-card fade-in"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {item.image_path ? (
                    <img src={item.image_path || "/placeholder.svg"} alt="Item Image" className="item-image" />
                  ) : (
                    <div className="item-image-placeholder">No Image</div>
                  )}

                  <div className="item-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3 style={{ margin: 0, color: "var(--gray-800)" }}>{item.name}</h3>
                      <span className={`status-badge status-${item.type}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>

                    <p style={{ color: "var(--gray-600)", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                      <strong>Category:</strong> {item.category}
                    </p>

                    <p style={{ color: "var(--gray-600)", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                      <strong>Location:</strong> {item.location}
                    </p>

                    <p style={{ color: "var(--gray-600)", margin: "0.5rem 0", fontSize: "0.9rem" }}>
                      <strong>Date:</strong>{" "}
                      {new Date(item.date_lost_found).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    <p style={{ color: "var(--gray-600)", margin: "1rem 0 0 0", fontSize: "0.85rem" }}>
                      Posted by {item.user_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <p style={{ color: "var(--gray-600)" }}>Found {items.length} item(s)</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
