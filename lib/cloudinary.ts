interface CloudinaryUploadResult {
  success: boolean
  url?: string
  public_id?: string
  error?: string
}

const CLOUDINARY_CONFIG = {
  cloud_name: "defkzzqcs",
  api_key: "587736895559589",
  api_secret: "TJGTsXiX2TLVWhpGDF2UmNj27V4",
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  try {
    const formData = new FormData()

    const timestamp = Math.round(Date.now() / 1000)
    const public_id = `lost_found_${timestamp}_${Math.random().toString(36).substring(7)}`

    const uploadParams = {
      public_id,
      timestamp: timestamp.toString(),
      folder: "lost_and_found",
    }

    const signature = await generateSignature(uploadParams)

    formData.append("file", file)
    formData.append("public_id", public_id)
    formData.append("timestamp", timestamp.toString())
    formData.append("folder", "lost_and_found")
    formData.append("api_key", CLOUDINARY_CONFIG.api_key)
    formData.append("signature", signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.secure_url) {
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      }
    } else {
      throw new Error("Invalid response from Cloudinary")
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

async function generateSignature(params: Record<string, string>): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")

  const stringToSign = sortedParams + CLOUDINARY_CONFIG.api_secret

  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const timestamp = Math.round(Date.now() / 1000)

    const params = {
      public_id: publicId,
      timestamp: timestamp.toString(),
    }

    const signature = await generateSignature(params)

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("timestamp", timestamp.toString())
    formData.append("api_key", CLOUDINARY_CONFIG.api_key)
    formData.append("signature", signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/destroy`, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()
    return result.result === "ok"
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    return false
  }
}
