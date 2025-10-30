"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getAgeAdaptation, getAgeAppropriateEmojis } from "@/lib/age-adaptations"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserData {
  id: string
  email: string
  fullName: string
  age?: number | null
  pictureUrl?: string | null
  points: number
  currentLevel: number
  streakDays: number
}

interface DashboardNavigationProps {
  userData?: UserData
}

export default function DashboardNavigation({ userData }: DashboardNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(userData || null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  // Update user state when userData prop changes
  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false)
      setIsProfileDropdownOpen(false)
    }

    if (isMobileMenuOpen || isProfileDropdownOpen) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [isMobileMenuOpen, isProfileDropdownOpen])

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Error signing out:', error)
      }

      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback redirect even if there's an error
      router.push('/auth/login')
    }
  }

  const isActive = (path: string) => pathname === path

  // Get age-based adaptations if user data is available
  const ageAdaptation = user ? getAgeAdaptation(user.age || null) : null
  const ageEmojis = user ? getAgeAppropriateEmojis(user.age || null) : null

  return (
    <>
      <header className="bg-cream/95 backdrop-blur-sm border-b border-sage-blue/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link href="/dashboard" className="flex items-center space-x-3 hover:scale-105 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-coral to-warm-green rounded-3xl flex items-center justify-center shadow-soft group-hover:shadow-lg">
                 <svg className="h-7 w-7 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Hinura</h1>
            </Link>

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                href="/dashboard"
                className={`font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-3xl ${
                  isActive("/dashboard") ? "bg-coral/10 text-coral font-bold" : "text-charcoal hover:text-coral hover:bg-coral/5"
                }`}
              >
                <span className="text-xl">🏠</span>
                <span className="hidden xl:inline">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/learn"
                className={`font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-3xl ${
                  isActive("/dashboard/learn") ? "bg-coral/10 text-coral font-bold" : "text-charcoal hover:text-coral hover:bg-coral/5"
                }`}
              >
                <span className="text-xl">📚</span>
                <span className="hidden xl:inline">Learn</span>
              </Link>
              <Link
                href="/dashboard/progress"
                className={`font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-3xl ${
                  isActive("/dashboard/progress") ? "bg-coral/10 text-coral font-bold" : "text-charcoal hover:text-coral hover:bg-coral/5"
                }`}
              >
                <span className="text-xl">📊</span>
                <span className="hidden xl:inline">Progress</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className={`font-medium transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-3xl ${
                  isActive("/dashboard/profile") ? "bg-coral/10 text-coral font-bold" : "text-charcoal hover:text-coral hover:bg-coral/5"
                }`}
              >
                <span className="text-xl">👤</span>
                <span className="hidden xl:inline">Profile</span>
              </Link>
            </nav>

            {/* User Profile Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Quick Stats - Hidden on small screens */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3 bg-cream/95 rounded-3xl px-3 lg:px-4 py-2 shadow-soft border border-sage-blue/10">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{ageEmojis?.streak || '🔥'}</span>
                    <span className={`text-sm font-bold text-charcoal`}>{user.streakDays}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{ageEmojis?.points || '⭐'}</span>
                    <span className={`text-sm font-bold text-charcoal`}>{user.points}</span>
                  </div>
                  <div className="hidden lg:flex items-center space-x-1">
                    <span className={`text-sm font-bold text-charcoal`}>{ageEmojis?.level || ''} Level {user.currentLevel}</span>
                  </div>
                </div>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleProfileDropdown()
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-coral to-warm-green rounded-3xl flex items-center justify-center hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral/50 shadow-soft overflow-hidden"
                >
                  {user?.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <span className="text-cream font-bold text-lg">{user?.fullName?.charAt(0) || "U"}</span>
                  )}
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-14 w-64 sm:w-72 bg-cream/95 backdrop-blur-sm rounded-3xl shadow-soft border border-sage-blue/20 z-50">
                    <div className="p-6 border-b border-sage-blue/20">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-coral to-warm-green rounded-3xl flex items-center justify-center overflow-hidden">
                          {user?.pictureUrl ? (
                            <img
                              src={user.pictureUrl}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-3xl"
                            />
                          ) : (
                            <span className="text-cream font-bold text-xl">{user?.fullName?.charAt(0) || "U"}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-charcoal text-lg">{user?.fullName || "User"}</p>
                          <p className="text-sm text-charcoal/60 font-medium">
                            Level {user?.currentLevel || 1} • {user?.points || 0} points
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-4 rounded-3xl hover:bg-red-50 transition-all duration-300 text-red-600 group"
                      >
                        <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
                        <span className="font-bold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMobileMenu()
                }}
                className="lg:hidden w-12 h-12 bg-cream/95 rounded-3xl flex items-center justify-center hover:bg-coral/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-coral/50 shadow-soft border border-sage-blue/10"
              >
                <span className="text-2xl">
                  {isMobileMenuOpen ? "❌" : "☰"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`lg:hidden fixed inset-x-0 top-[88px] z-40 transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-full opacity-0 invisible"
        } bg-cream/95 backdrop-blur-sm border-b border-sage-blue/20 shadow-soft`}
      >
        <nav className="px-6 py-6 space-y-3">
          <Link
            href="/dashboard"
            className={`flex items-center space-x-4 p-4 rounded-3xl transition-all duration-300 group ${
              isActive("/dashboard") ? "bg-coral/10 text-coral font-bold" : "hover:bg-coral/5 text-charcoal"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
            <span className="font-bold">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/learn"
            className={`flex items-center space-x-4 p-4 rounded-3xl transition-all duration-300 group ${
              isActive("/dashboard/learn") ? "bg-coral/10 text-coral font-bold" : "hover:bg-coral/5 text-charcoal"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
            <span className="font-bold">Learn</span>
          </Link>
          <Link
            href="/dashboard/progress"
            className={`flex items-center space-x-4 p-4 rounded-3xl transition-all duration-300 group ${
              isActive("/dashboard/progress") ? "bg-coral/10 text-coral font-bold" : "hover:bg-coral/5 text-charcoal"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
            <span className="font-bold">Progress</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className={`flex items-center space-x-4 p-4 rounded-3xl transition-all duration-300 group ${
              isActive("/dashboard/profile") ? "bg-coral/10 text-coral font-bold" : "hover:bg-coral/5 text-charcoal"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
            <span className="font-bold">Profile</span>
          </Link>
          <div className="border-t border-sage-blue/20 my-3"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 p-4 rounded-3xl hover:bg-red-50 transition-all duration-300 text-red-600 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
            <span className="font-bold">Sign Out</span>
          </button>
        </nav>
      </div>
    </>
  )
}
