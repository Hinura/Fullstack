// components/EDLStatusCard.tsx
'use client'

import React from 'react'
import type { EDLStatusResponse } from '@/lib/edl/types'

interface EDLStatusCardProps {
  subject: string
  status: Omit<EDLStatusResponse, 'subject'>
  subjectNames: Record<string, string>
  subjectEmojis: Record<string, string>
}

export function EDLStatusCard({
  subject,
  status,
  subjectNames,
  subjectEmojis
}: EDLStatusCardProps) {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'exceptional':
        return 'text-sage-blue bg-sage-blue/10'
      case 'approaching_mastery':
        return 'text-sage-blue bg-sage-blue/10'
      case 'flow_zone':
        return 'text-warm-green bg-warm-green/10'
      case 'challenging':
        return 'text-coral bg-coral/10'
      case 'struggling':
        return 'text-coral bg-coral/10'
      default:
        return 'text-charcoal/60 bg-charcoal/5'
    }
  }

  const getStatusLabel = (statusType: string) => {
    switch (statusType) {
      case 'exceptional':
        return '🎊 Exceptional'
      case 'approaching_mastery':
        return '⭐ Approaching Mastery'
      case 'flow_zone':
        return '🎯 Perfect Zone'
      case 'challenging':
        return '💪 Challenging'
      case 'struggling':
        return '📚 Building Foundation'
      default:
        return 'Unknown'
    }
  }

  const getAdjustmentIndicator = (adjustment: number) => {
    if (adjustment > 0) return `↑${adjustment} levels above`
    if (adjustment < 0) return `↓${Math.abs(adjustment)} levels below`
    return '→ At grade level'
  }

  return (
    <div className="bg-cream/95 rounded-3xl shadow-soft border border-charcoal/5 p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <span>{subjectEmojis[subject]}</span>
            <span>{subjectNames[subject]}</span>
          </h3>
          <p className="text-sm text-charcoal/60 mt-1">
            Learning Level: Age {status.effective_age} questions
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status.status)}`}>
          {getStatusLabel(status.status)}
        </div>
      </div>

      {/* Progress Bar */}
      {status.recent_accuracy !== null && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-charcoal/70">Recent Performance</span>
            <span className="font-bold text-charcoal">{status.recent_accuracy}%</span>
          </div>
          <div className="w-full bg-charcoal/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-warm-green to-sage-blue h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, status.recent_accuracy)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-charcoal/50 mt-1">
            <span>60% (Flow Start)</span>
            <span>85% (Mastery)</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-charcoal/60">Your Age</p>
          <p className="text-lg font-bold text-charcoal">{status.chronological_age}</p>
        </div>
        <div>
          <p className="text-xs text-charcoal/60">Effective Age</p>
          <p className="text-lg font-bold text-charcoal">
            {status.effective_age}
            <span className="text-sm ml-1 text-charcoal/60">
              {getAdjustmentIndicator(status.performance_adjustment)}
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs text-charcoal/60">Quizzes Taken</p>
          <p className="text-lg font-bold text-charcoal">{status.total_quizzes}</p>
        </div>
        <div>
          <p className="text-xs text-charcoal/60">Next Adjustment</p>
          <p className="text-lg font-bold text-charcoal">
            {status.next_adjustment_in === 0 ? 'Ready' : `${status.next_adjustment_in} more`}
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-gradient-to-r from-charcoal/5 to-charcoal/10 rounded-2xl p-4">
        <p className="text-sm text-charcoal/80 leading-relaxed">
          {status.status === 'flow_zone' &&
            "You're at the perfect challenge level! Keep practicing to maintain this sweet spot."}
          {status.status === 'approaching_mastery' &&
            "Excellent work! You're close to leveling up. Keep up the great performance!"}
          {status.status === 'exceptional' &&
            "Outstanding! You're mastering this level. A level up is coming soon!"}
          {status.status === 'challenging' &&
            "These questions are tough, but you're making progress. Keep at it!"}
          {status.status === 'struggling' &&
            "Let's focus on building a strong foundation. Practice makes perfect!"}
        </p>
      </div>
    </div>
  )
}
