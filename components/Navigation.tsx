"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function Navigation() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/messages/unread-count")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`} onClick={closeMobileMenu} />

      <header className="header">
        <nav className="nav">
          <Link href="/" className="logo">
            CIT E-Lost & Found
          </Link>

          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <ul className={`nav-links ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
            <li>
              <Link href="/" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" onClick={closeMobileMenu}>
                Search Items
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link href="/dashboard" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/report" onClick={closeMobileMenu}>
                    Report Item
                  </Link>
                </li>
                <li>
                  <Link href="/messages" onClick={closeMobileMenu}>
                    Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li>
                    <Link href="/admin" onClick={closeMobileMenu}>
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="nav-link-button">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}
