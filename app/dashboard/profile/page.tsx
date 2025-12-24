import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Trophy,
  Zap,
  Target,
  FileText,
  BarChart3,
  Eye,
  Award,
} from 'lucide-react'
import DashboardNavigation from '@/components/DashboardNavigation'
import ProfileEditor from '@/components/profile/ProfileEditor'
import ProfilePictureButton from '@/components/profile/ProfilePictureButton'
import { getProfileData } from '@/lib/data/profile-data'

export default async function ProfilePage() {
  // Server-side data fetch
  const data = await getProfileData()

  // Server-side birthdate check
  if (!data.user.birthdate) {
    redirect('/dashboard')
  }

  const { user, stats } = data

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getJoinDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-6 mb-6">
            <ProfilePictureButton userId={user.id} pictureUrl={user.pictureUrl} />
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
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Username</p>
                    <p className="text-xl font-bold text-charcoal">{user.username || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Full Name</p>
                    <p className="text-xl font-bold text-charcoal">{user.fullName || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Email</p>
                    <p className="text-xl text-charcoal">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Age</p>
                    <p className="text-xl font-bold text-charcoal">
                      {user.age ? `${user.age} years old` : 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-charcoal/60 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-xl text-charcoal">
                      {user.birthdate ? formatDate(user.birthdate) : 'Not available'}
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

                {/* ProfileEditor client component */}
                <ProfileEditor
                  initialData={{
                    username: user.username || '',
                    fullName: user.fullName,
                  }}
                />
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

                <div className="space-y-3">
                  {/* Total XP */}
                  <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-coral/10 via-coral/5 to-warm-green/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-coral/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-coral/20 rounded-xl flex items-center justify-center">
                          <Award className="w-4 h-4 text-coral" />
                        </div>
                        <span className="text-charcoal/70 font-semibold">Total XP</span>
                      </div>
                      <span className="font-bold text-charcoal text-xl">
                        {data.gamification?.totalPoints.toLocaleString() || user.points.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Overall Level */}
                  <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-warm-green/10 via-warm-green/5 to-sage-blue/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-warm-green/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-warm-green/20 rounded-xl flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-warm-green" />
                        </div>
                        <span className="text-charcoal/70 font-semibold">Overall Level</span>
                      </div>
                      <span className="font-bold text-charcoal text-xl">
                        Level {data.gamification?.overallLevel || user.currentLevel}
                      </span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-sage-blue/10 via-sage-blue/5 to-coral/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-sage-blue/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-sage-blue/20 rounded-xl flex items-center justify-center">
                          <Zap className="w-4 h-4 text-sage-blue" />
                        </div>
                        <span className="text-charcoal/70 font-semibold">Streak</span>
                      </div>
                      <span className="font-bold text-charcoal text-xl">
                        🔥 {data.gamification?.streak.currentDays || user.streakDays} days
                      </span>
                    </div>
                  </div>

                  {/* Streak Freeze - Only show if available */}
                  {data.gamification?.streak.freezeAvailable && (
                    <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-sage-blue/10 via-sage-blue/5 to-coral/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-sage-blue/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-sage-blue/20 rounded-xl flex items-center justify-center">
                            <span className="text-base">❄️</span>
                          </div>
                          <span className="text-charcoal/70 font-semibold">Streak Freeze</span>
                        </div>
                        <span className="font-bold text-sage-blue text-xl">Available</span>
                      </div>
                    </div>
                  )}

                  {/* Total Achievements */}
                  <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-coral/10 via-coral/5 to-warm-green/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-coral/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-coral/20 rounded-xl flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-coral" />
                        </div>
                        <span className="text-charcoal/70 font-semibold">Achievements</span>
                      </div>
                      <span className="font-bold text-charcoal text-xl">
                        🏆 {data.gamification?.achievements.total || 0}
                      </span>
                    </div>
                  </div>

                  {/* XP Last 7 Days - Only show if gamification exists */}
                  {data.gamification && data.gamification.recentActivity.xpLast7Days > 0 && (
                    <div className="group relative overflow-hidden p-4 bg-gradient-to-r from-warm-green/10 via-warm-green/5 to-sage-blue/10 rounded-2xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-warm-green/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-warm-green/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 text-warm-green" />
                          </div>
                          <span className="text-charcoal/70 font-semibold">XP (Last 7 Days)</span>
                        </div>
                        <span className="font-bold text-warm-green text-xl">
                          +{data.gamification.recentActivity.xpLast7Days.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {data.gamification && (
              <Card className="rounded-3xl shadow-soft border-0 bg-cream/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-warm-green/20 rounded-2xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-warm-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal">Next Level</h3>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-warm-green/10 via-sage-blue/10 to-coral/10 rounded-3xl border border-warm-green/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-semibold text-charcoal">
                        Overall Level {data.gamification.overallLevel}
                      </p>
                      <span className="text-sm font-bold text-warm-green">
                        {data.gamification.totalPoints.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="w-full bg-warm-green/20 rounded-full h-4 overflow-hidden mb-3">
                      <div
                        className="bg-gradient-to-r from-warm-green via-sage-blue to-coral rounded-full h-4 transition-all duration-700 ease-out shadow-sm"
                        style={{
                          width: `${Math.min(
                            ((data.gamification.totalPoints -
                              (data.gamification.overallLevel - 1) ** 2 * 100) /
                              (data.gamification.overallLevel ** 2 * 100 -
                                (data.gamification.overallLevel - 1) ** 2 * 100)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-charcoal/70 font-semibold text-center">
                      {(
                        data.gamification.overallLevel ** 2 * 100 -
                        data.gamification.totalPoints
                      ).toLocaleString()}{' '}
                      XP to Level {data.gamification.overallLevel + 1}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
