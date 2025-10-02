"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Edit3,
  Save,
  X,
  Trophy,
  Zap,
  Target,
  User,
  FileText,
  BarChart3,
  Eye,
  Award,
} from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"
import ProfilePictureUpload from "@/components/ProfilePictureUpload"
import { useBirthdateCheck } from "@/hooks/useBirthdateCheck"

interface UserProfile {
  id: string
  email: string
  username?: string
  fullName: string
  age: number
  birthdate: string
  pictureUrl?: string | null
  points: number
  currentLevel: number
  streakDays: number
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalExercises: number
  correctAnswers: number
  accuracyPercentage: number
  streakDays: number
  completedAssessments: number
}

interface DashboardData {
  user: UserProfile
  stats: UserStats
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    fullName: "",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPictureModal, setShowPictureModal] = useState(false)

  // Hook must be called at the top level, before any conditional returns
  const { canAccess } = useBirthdateCheck({ user: userData?.user, redirectTo: "/dashboard/profile" })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/dashboard/data")
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setEditForm({
          username: data.user.username || "",
          fullName: data.user.fullName || "",
        })
      } else {
        setMessage({ type: "error", text: "Failed to load profile data" })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setMessage({ type: "error", text: "Error loading profile data" })
    } finally {
      setLoading(false)
    }
  }


  const handleSave = async () => {
    if (!editForm.fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required" })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editForm.username.trim() || null,
          fullName: editForm.fullName.trim(),
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" })
        setEditing(false)
        await fetchUserData()
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to update profile" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error updating profile" })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setEditForm({
      username: userData?.user.username || "",
      fullName: userData?.user.fullName || "",
    })
    setMessage(null)
  }

  const handleProfilePictureUpdate = (newPictureUrl: string) => {
    if (userData) {
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          pictureUrl: newPictureUrl
        }
      })
      setMessage({ type: "success", text: "Profile picture updated successfully!" })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getJoinDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Loading your profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md rounded-3xl shadow-soft border-coral/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-coral" />
              </div>
              <p className="text-coral font-medium">Failed to load profile data. Please refresh the page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { user, stats } = userData

  // If user needs to set birthdate, redirect to dashboard
  if (!canAccess && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {message && (
          <Alert
            className={`mb-8 rounded-3xl border-0 shadow-soft ${message.type === "success" ? "bg-warm-green/10 text-warm-green" : "bg-coral/10 text-coral"}`}
          >
            <AlertDescription className="font-medium">{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={() => setShowPictureModal(true)}
              className="relative w-20 h-20 bg-gradient-to-br from-coral/20 to-warm-green/20 rounded-3xl flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-lg group overflow-hidden"
            >
              {user?.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <User className="w-10 h-10 text-charcoal group-hover:text-coral transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
            </button>
            <h1 className="text-5xl font-bold text-charcoal text-balance">My Profile</h1>
          </div>
          <p className="text-charcoal/70 text-xl max-w-2xl mx-auto text-pretty">
            View and manage your personal information and learning progress.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl shadow-soft border-0 bg-cream/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-sage-blue/20 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-sage-blue" />
                    </div>
                    <h2 className="text-3xl font-bold text-charcoal">Personal Information</h2>
                  </div>
                  {!editing && (
                    <Button
                      variant="outline"
                      onClick={() => setEditing(true)}
                      className="rounded-2xl border-sage-blue/30 text-sage-blue hover:bg-sage-blue/10 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="username" className="text-charcoal font-semibold text-lg">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={editForm.username || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                        className="rounded-2xl bg-cream/80 border-sage-blue/30 focus:border-coral focus:ring-coral/20 text-lg py-3"
                        placeholder="Enter your username (optional)"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-charcoal font-semibold text-lg">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="rounded-2xl bg-cream/80 border-sage-blue/30 focus:border-coral focus:ring-coral/20 text-lg py-3"
                        placeholder="Enter your full name"
                      />
                    </div>


                    <div className="flex space-x-4 pt-6">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-2xl bg-warm-green hover:bg-warm-green/90 text-cream px-8 py-3 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="font-semibold">{saving ? "Saving..." : "Save Changes"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                        className="rounded-2xl border-coral/30 text-coral hover:bg-coral/10 px-8 py-3 hover:scale-105 transition-all duration-200 flex items-center space-x-2 bg-transparent"
                      >
                        <X className="w-5 h-5" />
                        <span className="font-semibold">Cancel</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Username</p>
                      <p className="text-xl font-bold text-charcoal">{user.username || "Not set"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Full Name</p>
                      <p className="text-xl font-bold text-charcoal">{user.fullName || "Not set"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Email</p>
                      <p className="text-xl text-charcoal">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Age</p>
                      <p className="text-xl font-bold text-charcoal">
                        {user.age ? `${user.age} years old` : "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-xl text-charcoal">
                        {user.birthdate ? formatDate(user.birthdate) : "Not available"}
                      </p>
                      {!user.birthdate && (
                        <p className="text-sm text-charcoal/50 italic">
                          This information was not provided during registration
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Joined</p>
                      <p className="text-xl text-charcoal">{getJoinDate(user.createdAt)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Current Level</p>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-coral/20 rounded-xl flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-coral" />
                        </div>
                        <p className="text-xl font-bold text-charcoal">Level {user.currentLevel}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-soft border-0 bg-cream/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-coral" />
                  </div>
                  <h2 className="text-3xl font-bold text-charcoal">Learning Statistics</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="group bg-gradient-to-br from-coral/10 to-warm-green/10 rounded-3xl p-6 border border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-rotate-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-coral/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Trophy className="w-7 h-7 text-coral" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-charcoal">{stats.totalExercises}</p>
                        <p className="text-sm font-medium text-charcoal/60">Exercises Completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-warm-green/10 to-sage-blue/10 rounded-3xl p-6 border border-warm-green/20 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:rotate-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-warm-green/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Target className="w-7 h-7 text-warm-green" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-charcoal">{stats.accuracyPercentage}%</p>
                        <p className="text-sm font-medium text-charcoal/60">Overall Accuracy</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-sage-blue/10 to-coral/10 rounded-3xl p-6 border border-sage-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-rotate-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-sage-blue/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Zap className="w-7 h-7 text-sage-blue" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-charcoal">{stats.streakDays}</p>
                        <p className="text-sm font-medium text-charcoal/60">Day Streak</p>
                      </div>
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-coral/10 to-sage-blue/10 rounded-3xl p-6 border border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:rotate-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-coral/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Award className="w-7 h-7 text-coral" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-charcoal">{user.points}</p>
                        <p className="text-sm font-medium text-charcoal/60">Total Points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-3xl shadow-soft border-0 bg-cream/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-sage-blue/20 rounded-2xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-sage-blue" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal">At a Glance</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral/10 to-warm-green/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <span className="text-charcoal/70 font-medium">Points</span>
                    <span className="font-bold text-charcoal text-xl">{user.points}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warm-green/10 to-sage-blue/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <span className="text-charcoal/70 font-medium">Level</span>
                    <span className="font-bold text-charcoal text-xl">{user.currentLevel}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sage-blue/10 to-coral/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <span className="text-charcoal/70 font-medium">Streak</span>
                    <span className="font-bold text-charcoal text-xl">{user.streakDays} days</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral/10 to-warm-green/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <span className="text-charcoal/70 font-medium">Assessments</span>
                    <span className="font-bold text-charcoal text-xl">{stats.completedAssessments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-soft border-0 bg-cream/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-warm-green/20 rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-warm-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal">Progress Goals</h3>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-warm-green/10 rounded-3xl border border-warm-green/20 hover:shadow-md transition-all duration-200">
                    <p className="text-lg font-semibold text-charcoal mb-3">Daily Learning Goal</p>
                    <div className="w-full bg-warm-green/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-warm-green to-sage-blue rounded-full h-3 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min((stats.totalExercises % 10) * 10, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-charcoal/60 mt-2 font-medium">
                      {stats.totalExercises % 10}/10 exercises today
                    </p>
                  </div>

                  <div className="p-5 bg-coral/10 rounded-3xl border border-coral/20 hover:shadow-md transition-all duration-200">
                    <p className="text-lg font-semibold text-charcoal mb-3">Accuracy Target</p>
                    <div className="w-full bg-coral/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-coral to-warm-green rounded-full h-3 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(stats.accuracyPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-charcoal/60 mt-2 font-medium">{stats.accuracyPercentage}% accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Profile Picture Modal */}
      {showPictureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream/95 backdrop-blur-sm rounded-3xl shadow-soft border border-sage-blue/20 w-full max-w-md">
            <div className="p-6 border-b border-sage-blue/20">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-charcoal">Profile Picture</h3>
                <button
                  onClick={() => setShowPictureModal(false)}
                  className="w-10 h-10 bg-coral/10 hover:bg-coral/20 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <X className="w-5 h-5 text-coral" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <ProfilePictureUpload
                userId={user.id}
                currentPictureUrl={user.pictureUrl}
                onUploadComplete={(url) => {
                  handleProfilePictureUpdate(url)
                  setShowPictureModal(false)
                }}
                className="flex justify-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
