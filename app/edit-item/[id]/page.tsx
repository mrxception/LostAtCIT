"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface Item {
  id: number
  name: string
  type: "lost" | "found"
  category: string
  location: string
  date_lost_found: string
  contact_info?: string
  description: string
  image_path?: string
}

export default function EditItemPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    category: "",
    location: "",
    date_lost_found: "",
    contact_info: "",
    description: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user && params.id) {
      fetchItem()
    }
  }, [user, loading, params.id, router])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/user/items/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
        setFormData({
          type: data.type,
          name: data.name,
          category: data.category,
          location: data.location,
          date_lost_found: data.date_lost_found,
          contact_info: data.contact_info || "",
          description: data.description,
        })
      } else if (response.status === 404) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch item:", error)
      router.push("/dashboard")
    } finally {
      setDataLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        e.target.value = ""
        return
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
        e.target.value = ""
        return
      }

      setImage(file)
      setRemoveImage(false)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const requiredFields = ["type", "name", "category", "location", "date_lost_found", "description"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData].trim())

    if (missingFields.length > 0) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      return
    }

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      if (image) {
        submitData.append("image", image)
      }

      if (removeImage) {
        submitData.append("remove_image", "1")
      }

      const response = await fetch(`/api/user/items/${params.id}`, {
        method: "PUT",
        body: submitData,
      })

      if (response.ok) {
        router.push("/dashboard?updated=success")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update item. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="container" style={{ marginTop: "2rem", textAlign: "center" }}>
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!user || !item) {
    return null // Will redirect
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem", textAlign: "center" }}>Edit Item</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: "2rem" }}>
              <div>
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select type</option>
                    <option value="lost">Lost Item</option>
                    <option value="found">Found Item</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="e.g., iPhone 12, Blue Backpack, Student ID"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Books">Books</option>
                    <option value="Documents">Documents</option>
                    <option value="Keys">Keys</option>
                    <option value="Bags">Bags</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="e.g., Library 2nd Floor, Engineering Building, Cafeteria"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <div className="form-group">
                  <label htmlFor="date_lost_found" className="form-label">
                    Date Lost/Found *
                  </label>
                  <input
                    type="date"
                    id="date_lost_found"
                    name="date_lost_found"
                    value={formData.date_lost_found}
                    onChange={handleChange}
                    className="form-input"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact_info" className="form-label">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    id="contact_info"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Phone number, email, or other contact details"
                    disabled={isSubmitting}
                  />
                  <small style={{ color: "var(--gray-600)", fontSize: "0.8rem" }}>
                    Optional: Others can contact you directly
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Image</label>
                  {item.image_path && !removeImage ? (
                    <div style={{ marginBottom: "1rem" }}>
                      <img
                        src={item.image_path || "/placeholder.svg"}
                        alt="Current item image"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--gray-200)",
                        }}
                      />
                      <div style={{ marginTop: "0.5rem" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--danger)",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={removeImage}
                            onChange={(e) => setRemoveImage(e.target.checked)}
                            disabled={isSubmitting}
                          />
                          Remove current image
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "var(--gray-600)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                      {removeImage ? "Image will be removed" : "No image uploaded"}
                    </p>
                  )}

                  <label htmlFor="image" className="form-label">
                    Upload New Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    className="form-input"
                    accept="image/*"
                    disabled={isSubmitting || removeImage}
                  />
                  <small style={{ color: "var(--gray-600)", fontSize: "0.8rem" }}>
                    Supported formats: JPEG, PNG, GIF, WebP (Max: 5MB)
                    <br />
                    Leave empty to keep current image
                  </small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                required
                placeholder="Provide detailed description including color, size, brand, distinctive features, circumstances of loss/finding, etc."
                disabled={isSubmitting}
              />
            </div>

            <div
              style={{
                backgroundColor: "var(--light-gold)",
                padding: "1rem",
                borderRadius: "0.5rem",
                margin: "1.5rem 0",
              }}
            >
              <p style={{ color: "var(--primary-maroon)", fontWeight: 600, margin: 0 }}>
                ⚠️ Note: After editing, your item will need to be reviewed again by administrators before being
                published.
              </p>
            </div>

            <div className="edit-form-actions">
              <Link href="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
