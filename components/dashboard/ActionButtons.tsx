'use client'

import { Button } from '@/components/ui/button'

export function AssessmentButton() {
  return (
    <Button
      onClick={() => (window.location.href = '/dashboard/assessment')}
      className="bg-coral hover:bg-coral/90 text-cream"
    >
      Start Assessment
    </Button>
  )
}

export function StartLearningButton() {
  return (
    <Button
      onClick={() => (window.location.href = '/dashboard/learn')}
      className="bg-gradient-to-r from-coral to-warm-green hover:opacity-90 text-cream transition-all shadow-soft hover:shadow-lg rounded-2xl px-8 py-3 font-semibold hover:scale-[1.02] duration-300"
    >
      📚 Start Learning
    </Button>
  )
}

export function ViewDetailsButton() {
  return (
    <Button
      variant="outline"
      onClick={() => (window.location.href = '/dashboard/progress')}
      className="border-2 border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-all rounded-2xl px-8 py-3 font-semibold hover:scale-[1.02] duration-300"
    >
      📊 View Details
    </Button>
  )
}
