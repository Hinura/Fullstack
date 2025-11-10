"use client"

import type { EDLStatus, PerformanceAdjustment } from "@/lib/edl/types"

interface EDLStatusCardProps {
  subject: string
  status: {
    chronological_age: number
    performance_adjustment: PerformanceAdjustment
    effective_age: number
    recent_accuracy: number | null
    total_quizzes: number
    has_completed_assessment: boolean
    last_quiz_at: string | null
    status: EDLStatus
    next_adjustment_in: number
  }
  subjectNames: Record<string, string>
  subjectEmojis: Record<string, string>
}

export function EDLStatusCard({ subject, status, subjectNames, subjectEmojis }: EDLStatusCardProps) {
  const getSubjectColor = () => {
    switch (subject) {
      case "math":
        return {
          gradient: "from-coral to-coral/80",
          border: "border-coral/30",
          accent: "text-coral",
          bg: "bg-coral/10",
          darkBorder: "dark:border-coral/20",
          darkBg: "dark:bg-coral/20",
          badge: "bg-coral/15 text-coral dark:bg-coral/30 dark:text-cream",
          progress: "from-coral to-warm-green",
        }
      case "english":
        return {
          gradient: "from-sage-blue to-sage-blue/80",
          border: "border-sage-blue/30",
          accent: "text-sage-blue",
          bg: "bg-sage-blue/10",
          darkBorder: "dark:border-sage-blue/20",
          darkBg: "dark:bg-sage-blue/20",
          badge: "bg-sage-blue/15 text-sage-blue dark:bg-sage-blue/30 dark:text-cream",
          progress: "from-sage-blue to-warm-green",
        }
      case "science":
        return {
          gradient: "from-warm-green to-warm-green/80",
          border: "border-warm-green/30",
          accent: "text-warm-green",
          bg: "bg-warm-green/10",
          darkBorder: "dark:border-warm-green/20",
          darkBg: "dark:bg-warm-green/20",
          badge: "bg-warm-green/15 text-warm-green dark:bg-warm-green/30 dark:text-cream",
          progress: "from-warm-green to-sage-blue",
        }
      default:
        return {
          gradient: "from-coral to-coral/80",
          border: "border-coral/30",
          accent: "text-coral",
          bg: "bg-coral/10",
          darkBorder: "dark:border-coral/20",
          darkBg: "dark:bg-coral/20",
          badge: "bg-coral/15 text-coral dark:bg-coral/30 dark:text-cream",
          progress: "from-coral to-warm-green",
        }
    }
  }

  const getStatusLabel = (edlStatus: EDLStatus) => {
    switch (edlStatus) {
      case "exceptional":
        return { label: "Exceptional", icon: "🎊" }
      case "approaching_mastery":
        return { label: "Approaching Mastery", icon: "⭐" }
      case "flow_zone":
        return { label: "Perfect Zone", icon: "🎯" }
      case "challenging":
        return { label: "Challenging", icon: "💪" }
      case "struggling":
        return { label: "Building Foundation", icon: "📚" }
      default:
        return { label: "Assessing", icon: "📊" }
    }
  }

  const colors = getSubjectColor()
  const statusInfo = getStatusLabel(status.status)
  const ageDifference = status.effective_age - status.chronological_age
  const accuracyPercent = status.recent_accuracy ? Math.round(status.recent_accuracy) : 0

  return (
    <div
      className={`group relative bg-cream/95 dark:bg-dark-surface rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 ${colors.border} ${colors.darkBorder}`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-16 h-16 bg-gradient-to-br from-${colors.bg} to-${colors.bg}/70 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:rotate-6 transition-transform duration-300`}
          >
            {subjectEmojis[subject] || "📖"}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-2xl text-charcoal leading-tight">
              {subjectNames[subject] || subject}
            </h3>
            <p className="text-sm text-charcoal/60 mt-1">
              {status.total_quizzes} {status.total_quizzes === 1 ? "quiz" : "quizzes"} completed
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className={`${colors.bg} ${colors.darkBg} rounded-xl p-4 border-2 ${colors.border} ${colors.darkBorder}`}>
          <p className="text-xs text-charcoal/60 dark:text-charcoal/60 font-medium mb-2">Effective Age</p>
          <p className={`text-3xl font-bold ${colors.accent}`}>{status.effective_age}</p>
          <p className="text-xs text-charcoal/60 dark:text-charcoal/60 mt-2">
            {ageDifference > 0 ? `+${ageDifference}` : ageDifference} from age
          </p>
        </div>

        <div className={`${colors.bg} ${colors.darkBg} rounded-xl p-4 border-2 ${colors.border} ${colors.darkBorder}`}>
          <p className="text-xs text-charcoal/60 dark:text-charcoal/60 font-medium mb-2">Zone</p>
          <div className={`inline-flex items-center gap-2 text-sm font-bold ${colors.accent}`}>
            <span className={`text-lg`}>{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-charcoal dark:text-charcoal">Progress to Mastery</p>
          <p className={`text-sm font-bold ${colors.accent}`}>
            {accuracyPercent}%
          </p>
        </div>
        <div className="w-full h-3 bg-charcoal/10 dark:bg-charcoal/50 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${accuracyPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Info Section */}
      <div className="space-y-3 pt-4 border-t border-charcoal/10 dark:border-cream/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal/70 dark:text-charcoal/70">Last Activity</p>
          <p className={`text-sm font-bold ${colors.accent}`}>
            {status.last_quiz_at
              ? new Date(status.last_quiz_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Not yet"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-charcoal/70 dark:text-charcoal/70">Next Adjustment In</p>
          <p className={`text-sm font-bold ${colors.accent}`}>
            {status.next_adjustment_in} {status.next_adjustment_in === 1 ? "quiz" : "quizzes"}
          </p>
        </div>
      </div>
    </div>
  )
}
