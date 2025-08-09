"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { uploadToCloudinary } from "@/lib/cloudinary"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function ReportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError("")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
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
      setError("")

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    setUploadProgress("Validating form...")

    const requiredFields = ["type", "name", "category", "location", "date_lost_found", "description"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData].trim())

    if (missingFields.length > 0) {
      setError("Please fill in all required fields.")
      setIsSubmitting(false)
      setUploadProgress("")
      return
    }

    try {
      let imageUrl = ""
      let cloudinaryPublicId = ""

      // Upload image to Cloudinary if provided
      if (image) {
        setUploadProgress("Uploading image...")
        const uploadResult = await uploadToCloudinary(image)

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
          cloudinaryPublicId = uploadResult.public_id || ""
        } else {
          setError(`Image upload failed: ${uploadResult.error}`)
          setIsSubmitting(false)
          setUploadProgress("")
          return
        }
      }

      setUploadProgress("Submitting report...")

      // Submit form data
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_path: imageUrl,
          cloudinary_public_id: cloudinaryPublicId,
        }),
      })

      if (response.ok) {
        setSuccess("Item reported successfully! It will be reviewed by administrators before being published.")
        setFormData({
          type: "",
          name: "",
          category: "",
          location: "",
          date_lost_found: "",
          contact_info: "",
          description: "",
        })
        setImage(null)
        setImagePreview(null)
        const fileInput = document.getElementById("image") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to report item. Please try again.")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <main className="container" style={{ marginTop: "2rem", marginBottom: "2rem", paddingBottom: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ color: "var(--primary-maroon)", marginBottom: "2rem", textAlign: "center" }}>
          Report Lost or Found Item
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        {success && <div className="alert alert-success">{success}</div>}

        {isSubmitting && uploadProgress && (
          <div className="alert" style={{ backgroundColor: "var(--light-gold)", color: "var(--primary-maroon)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LoadingSpinner size="sm" />
              {uploadProgress}
            </div>
          </div>
        )}

        <div
          className="card"
          style={{ marginTop: "2rem", marginBottom: "2rem", backgroundColor: "var(--light-maroon)" }}
        >
          <h3 style={{ color: "var(--primary-maroon)", marginBottom: "1rem" }}>📋 Reporting Guidelines</h3>
          <ul style={{ color: "var(--gray-600)", lineHeight: 1.8, listStyleType: "none" }}>
            <li>
              <strong>• Be Detailed:</strong> Include as much information as possible about the item
            </li>
            <li>
              <strong>• Upload Photos:</strong> Clear images help others identify items quickly
            </li>
            <li>
              <strong>• Accurate Location:</strong> Specify exactly where the item was lost or found
            </li>
            <li>
              <strong>• Contact Info:</strong> Provide reliable contact information for quick communication
            </li>
            <li>
              <strong>• Admin Review:</strong> All reports are reviewed before being published
            </li>
          </ul>
        </div>

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
                  <label htmlFor="image" className="form-label">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    className="form-input"
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                  <small style={{ color: "var(--gray-600)", fontSize: "0.8rem" }}>
                    Supported formats: JPEG, PNG, GIF, WebP (Max: 10MB)
                  </small>

                  {imagePreview && (
                    <div style={{ marginTop: "1rem" }}>
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--gray-200)",
                        }}
                      />
                    </div>
                  )}
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
              className="form-actions"
              style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}
            >
              <Link href="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
