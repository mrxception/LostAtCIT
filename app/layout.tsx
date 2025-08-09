import type React from "react"
import type { Metadata } from "next"
import { AuthProvider } from "@/contexts/AuthContext"
import Navigation from "@/components/Navigation"
import "./globals.css"

export const metadata: Metadata = {
  title: "CIT E-Lost & Found",
  description: "Digital Lost and Found Portal for Cebu Institute of Technology – University",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="main-wrapper">
            <Navigation />
            <main className="flex-1">{children}</main>
            <footer className="footer">
              <div className="container">
                <p>&copy; 2025 CIT E-Lost & Found. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
