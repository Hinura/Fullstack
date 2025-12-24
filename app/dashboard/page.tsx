import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DashboardNavigation from '@/components/DashboardNavigation'
import { SubjectProgressGrid } from '@/components/gamification/SubjectProgressGrid'
import { RecentAchievementsCard } from '@/components/gamification/RecentAchievementsCard'
import WelcomeAlert from '@/components/dashboard/WelcomeAlert'
import TimeCountdown from '@/components/dashboard/TimeCountdown'
import BirthdateSetupWrapper from '@/components/dashboard/BirthdateSetupWrapper'
import { AssessmentButton, StartLearningButton, ViewDetailsButton } from '@/components/dashboard/ActionButtons'
import { getProfileData } from '@/lib/data/profile-data'

export default async function DashboardPage() {
  // Server-side data fetch
  const dashboardData = await getProfileData()

  const { user, stats, hasCompletedAssessment } = dashboardData

  // Check if user needs to set birthdate
  const needsBirthdateSetup = !user.birthdate || !user.age

  // Calculate XP to next level
  const xpToNextLevel = dashboardData.gamification
    ? dashboardData.gamification.overallLevel ** 2 * 100 - dashboardData.gamification.totalPoints
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

      <Suspense fallback={null}>
        <BirthdateSetupWrapper needsBirthdateSetup={needsBirthdateSetup}>
          <main className="max-w-7xl mx-auto px-6 py-8">
            <Suspense fallback={null}>
              <WelcomeAlert hasCompletedAssessment={hasCompletedAssessment} />
            </Suspense>

            <div className="mb-8">
              <h1 className="text-5xl font-bold text-charcoal mb-3">
                Hey {user.fullName.replace(/\b\w/g, (c) => c.toUpperCase())} 👋
              </h1>
              <p className="text-xl text-charcoal/70">
                {hasCompletedAssessment
                  ? 'Ready to continue your personalized learning adventure?'
                  : "Let's start by taking your skill assessment to personalize your experience!"}
              </p>
            </div>

            {!hasCompletedAssessment && (
              <Alert className="mb-10 border-2 border-coral/30 bg-coral/10 rounded-3xl shadow-soft">
                <AlertDescription className="text-coral/90">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">🎯</span>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Complete Your Skill Assessment</h3>
                        <p className="text-base leading-relaxed">
                          Take a quick assessment to personalize your learning experience and get the most out of
                          Hinura!
                        </p>
                      </div>
                    </div>
                    <AssessmentButton />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {hasCompletedAssessment && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                    <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                      <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-2xl">📚</span>
                      </div>
                      <div className="text-3xl font-bold text-charcoal mb-1">{stats.totalExercises}</div>
                      <div className="text-sm text-charcoal/60 font-medium">Exercises</div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coral/98 to-warm-green/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <span className="text-4xl">📅</span>
                        </div>
                        <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                          This Week
                        </div>
                        <div className="text-3xl font-bold text-cream tracking-wide">{stats.weeklyExercises}</div>
                        <div className="text-xs text-cream/70 font-medium">Exercises completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-warm-green/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                    <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                      <div className="w-12 h-12 bg-warm-green/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="text-3xl font-bold text-charcoal mb-1">{stats.accuracyPercentage}%</div>
                      <div className="text-sm text-charcoal/60 font-medium">Accuracy</div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-warm-green/98 to-sage-blue/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <span className="text-4xl">🏆</span>
                        </div>
                        <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                          Best Score
                        </div>
                        <div className="text-3xl font-bold text-cream tracking-wide">{stats.bestAccuracy}%</div>
                        <div className="text-xs text-cream/70 font-medium">Your highest accuracy</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-sage-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                    <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                      <div className="w-12 h-12 bg-sage-blue/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-2xl">🔥</span>
                      </div>
                      <div className="text-3xl font-bold text-charcoal mb-1">{stats.streakDays}</div>
                      <div className="text-sm text-charcoal/60 font-medium">Day Streak</div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sage-blue/98 to-warm-green/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <span className="text-4xl">⏰</span>
                        </div>
                        <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                          Time Remaining
                        </div>
                        <div className="text-3xl font-bold text-cream tracking-wide">
                          <TimeCountdown />
                        </div>
                        <div className="text-xs text-cream/70 font-medium">Until streak resets</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                    <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                      <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-2xl">⭐</span>
                      </div>
                      <div className="text-3xl font-bold text-charcoal mb-1">{user.points}</div>
                      <div className="text-sm text-charcoal/60 font-medium">Total XP</div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coral/98 to-sage-blue/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                      <div className="text-center space-y-3">
                        <div className="flex justify-center">
                          <span className="text-4xl">⬆️</span>
                        </div>
                        <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                          To Next Level
                        </div>
                        <div className="text-3xl font-bold text-cream tracking-wide">{xpToNextLevel}</div>
                        <div className="text-xs text-cream/70 font-medium">XP needed</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gamification Section */}
                {dashboardData.gamification && (
                  <div className="space-y-8 mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-charcoal mb-2">Your Progress</h2>
                      <p className="text-charcoal/60">Track your learning journey and achievements</p>
                    </div>

                    <RecentAchievementsCard
                      unlockedAchievements={dashboardData.gamification.achievements.unlocked}
                      lockedAchievements={dashboardData.gamification.achievements.locked}
                      totalCount={dashboardData.gamification.achievements.total}
                    />

                    <div>
                      <h3 className="text-3xl font-bold text-charcoal mb-6">Subject Levels</h3>
                      <div className="grid md:grid-cols-3 gap-5">
                        <SubjectProgressGrid
                          subjects={[
                            {
                              subject: 'math',
                              level: dashboardData.gamification.subjects.math.level,
                              currentPoints: dashboardData.gamification.subjects.math.points,
                              pointsToNextLevel: dashboardData.gamification.subjects.math.pointsToNextLevel,
                            },
                            {
                              subject: 'english',
                              level: dashboardData.gamification.subjects.english.level,
                              currentPoints: dashboardData.gamification.subjects.english.points,
                              pointsToNextLevel: dashboardData.gamification.subjects.english.pointsToNextLevel,
                            },
                            {
                              subject: 'science',
                              level: dashboardData.gamification.subjects.science.level,
                              currentPoints: dashboardData.gamification.subjects.science.points,
                              pointsToNextLevel: dashboardData.gamification.subjects.science.pointsToNextLevel,
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Call to Action */}
            {hasCompletedAssessment && (
              <div className="bg-cream/95 rounded-3xl p-8 text-center shadow-soft border border-sage-blue/10">
                <h3 className="text-3xl font-bold text-charcoal mb-3">Ready to Continue Learning?</h3>
                <p className="text-base text-charcoal/60 mb-6 max-w-2xl mx-auto">
                  Your personalized learning path is ready. Pick up where you left off!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <StartLearningButton />
                  <ViewDetailsButton />
                </div>
              </div>
            )}
          </main>
        </BirthdateSetupWrapper>
      </Suspense>
    </div>
  )
}
