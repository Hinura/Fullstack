"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface UserData {
  id: string
  email: string
  fullName: string
  points: number
  currentLevel: number
  streakDays: number
}

interface DashboardNavigationProps {
  userData?: UserData
}

export default function DashboardNavigation({ userData }: DashboardNavigationProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<UserData | null>(userData || null)

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          fullName: profile.full_name || 'User',
          points: profile.points || 0,
          currentLevel: profile.current_level || 1,
          streakDays: profile.streak_days || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [supabase])

  useEffect(() => {
    if (!userData) {
      fetchUserData()
    }
  }, [userData, fetchUserData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-cream/95 backdrop-blur-sm border-b border-sage-blue/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-coral to-warm-green rounded-2xl flex items-center justify-center">
              <span className="text-cream font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-bold text-charcoal">Hinura</h1>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className={`font-medium transition-colors duration-300 ${
                isActive('/dashboard')
                  ? 'text-coral font-semibold'
                  : 'text-charcoal hover:text-coral'
              }`}
            >
              🏠 Dashboard
            </Link>
            <Link
              href="/dashboard/learn"
              className={`font-medium transition-colors duration-300 ${
                isActive('/dashboard/learn')
                  ? 'text-coral font-semibold'
                  : 'text-charcoal hover:text-coral'
              }`}
            >
              📚 Learn
            </Link>
            <Link
              href="/dashboard/progress"
              className={`font-medium transition-colors duration-300 ${
                isActive('/dashboard/progress')
                  ? 'text-coral font-semibold'
                  : 'text-charcoal hover:text-coral'
              }`}
            >
              📊 Progress
            </Link>
            <Link
              href="/dashboard/profile"
              className={`font-medium transition-colors duration-300 ${
                isActive('/dashboard/profile')
                  ? 'text-coral font-semibold'
                  : 'text-charcoal hover:text-coral'
              }`}
            >
              👤 Profile
            </Link>
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3 bg-sage-blue/10 rounded-2xl px-4 py-2">
                <span className="text-sm font-medium text-charcoal">🔥 {user.streakDays} days</span>
                <span className="text-sm font-medium text-charcoal">⭐ {user.points} pts</span>
                <span className="text-sm font-medium text-charcoal">📊 Level {user.currentLevel}</span>
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="w-10 h-10 bg-gradient-to-br from-sage-blue to-warm-green rounded-2xl flex items-center justify-center hover:scale-105 transition-transform duration-300">
                <span className="text-cream font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-12 w-64 bg-cream/95 backdrop-blur-sm rounded-2xl shadow-lg border border-sage-blue/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-4 border-b border-sage-blue/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sage-blue to-warm-green rounded-2xl flex items-center justify-center">
                      <span className="text-cream font-bold text-lg">{user?.fullName?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">{user?.fullName || 'User'}</p>
                      <p className="text-sm text-charcoal/60">Level {user?.currentLevel || 1} • {user?.points || 0} points</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link href="/dashboard/profile" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-sage-blue/10 transition-colors duration-300">
                    <span>👤</span>
                    <span className="text-charcoal font-medium">View Profile</span>
                  </Link>
                  <Link href="/dashboard/progress" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-sage-blue/10 transition-colors duration-300">
                    <span>📊</span>
                    <span className="text-charcoal font-medium">My Progress</span>
                  </Link>
                  <Link href="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-sage-blue/10 transition-colors duration-300">
                    <span>🏠</span>
                    <span className="text-charcoal font-medium">Dashboard</span>
                  </Link>
                  <div className="border-t border-sage-blue/20 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-300 text-red-600"
                  >
                    <span>🚪</span>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden w-10 h-10 bg-sage-blue/20 rounded-2xl flex items-center justify-center">
              <span className="text-sage-blue">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden fixed inset-x-0 top-20 z-40 transform -translate-y-full transition-transform duration-300 bg-cream/95 backdrop-blur-sm border-b border-sage-blue/20 shadow-lg">
        <nav className="px-6 py-4 space-y-3">
          <Link href="/dashboard" className={`flex items-center space-x-3 p-3 rounded-xl ${isActive('/dashboard') ? 'bg-coral/10' : 'hover:bg-sage-blue/10'}`}>
            <span>🏠</span>
            <span className={`font-medium ${isActive('/dashboard') ? 'text-coral font-semibold' : 'text-charcoal'}`}>Dashboard</span>
          </Link>
          <Link href="/dashboard/learn" className={`flex items-center space-x-3 p-3 rounded-xl ${isActive('/dashboard/learn') ? 'bg-coral/10' : 'hover:bg-sage-blue/10'}`}>
            <span>📚</span>
            <span className={`font-medium ${isActive('/dashboard/learn') ? 'text-coral font-semibold' : 'text-charcoal'}`}>Learn</span>
          </Link>
          <Link href="/dashboard/progress" className={`flex items-center space-x-3 p-3 rounded-xl ${isActive('/dashboard/progress') ? 'bg-coral/10' : 'hover:bg-sage-blue/10'}`}>
            <span>📊</span>
            <span className={`font-medium ${isActive('/dashboard/progress') ? 'text-coral font-semibold' : 'text-charcoal'}`}>Progress</span>
          </Link>
          <Link href="/dashboard/profile" className={`flex items-center space-x-3 p-3 rounded-xl ${isActive('/dashboard/profile') ? 'bg-coral/10' : 'hover:bg-sage-blue/10'}`}>
            <span>👤</span>
            <span className={`font-medium ${isActive('/dashboard/profile') ? 'text-coral font-semibold' : 'text-charcoal'}`}>Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}