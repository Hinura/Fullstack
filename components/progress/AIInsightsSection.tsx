'use client'

import { useState, useEffect } from 'react'
import { Loader2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIInsightsSectionProps {
  userAge?: number
  stats: {
    averageScore: number
    totalQuizzes: number
  }
  attempts: Array<{
    subject: string
    score_percentage: number
  }>
  chartData: Array<{
    date: string
    math: number | null
    english: number | null
    science: number | null
  }>
}

export default function AIInsightsSection({
  userAge,
  stats,
  attempts,
  chartData
}: AIInsightsSectionProps) {
  const [insights, setInsights] = useState<{ summary: string; goals: string[] } | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightDots, setInsightDots] = useState('.')

  useEffect(() => {
    if (!insightsLoading) return
    const t = setInterval(() => {
      setInsightDots((d) => (d.length < 3 ? d + '.' : '.'))
    }, 500)
    return () => clearInterval(t)
  }, [insightsLoading])

  async function generateInsights() {
    // Build a short summary of latest results
    const trendText = chartData.length > 1
      ? `Latest scores: ${chartData
          .slice(-3)
          .map(
            (d) =>
              `${d.date} (M:${d.math ?? '-'} E:${d.english ?? '-'} S:${d.science ?? '-'})`
          )
          .join(', ')}`
      : 'Not enough data'

    const bySubject = {
      math: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === 'math')
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === 'math').length)
          : 0
      ),
      english: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === 'english')
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === 'english').length)
          : 0
      ),
      science: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === 'science')
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === 'science').length)
          : 0
      ),
    }

    try {
      setInsightsLoading(true)
      setInsights(null)

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: userAge ?? null,
          aggregates: {
            avgScore: Math.round(stats.averageScore),
            quizzes: stats.totalQuizzes,
            bySubject,
          },
          trendText,
        }),
      })
      const data = await res.json()
      if (res.ok) setInsights(data?.data ?? null)
    } catch (e) {
      console.error('Error generating insights:', e)
    } finally {
      setInsightsLoading(false)
    }
  }

  return (
    <div className="mb-8 bg-cream/95 rounded-3xl p-8 shadow-soft border border-sage-blue/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-charcoal flex items-center">
          <span className="mr-3">🤖</span> AI Learning Insights
        </h2>
        <Button
          onClick={generateInsights}
          disabled={insightsLoading}
          className="bg-gradient-to-r from-sage-blue to-warm-green text-cream font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {insightsLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2 text-cream" />
              {`Generating${insightDots}`}
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2 text-cream" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {insights ? (
        <div className="mt-6 space-y-6">
          {/* Summary Section */}
          <div className="bg-gradient-to-br from-sage-blue/10 to-warm-green/10 rounded-2xl p-6 border-2 border-sage-blue/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-sage-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-charcoal mb-2">Summary</h3>
                <p className="text-base text-charcoal leading-relaxed">{insights.summary}</p>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-gradient-to-br from-warm-green/10 to-coral/10 rounded-2xl p-6 border-2 border-warm-green/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-warm-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-charcoal mb-3">Recommended Goals</h3>
                <div className="space-y-3">
                  {insights.goals.map((goal, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-warm-green/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-warm-green">{i + 1}</span>
                      </div>
                      <p className="text-base text-charcoal leading-relaxed flex-1">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center py-8">
          <div className="w-16 h-16 bg-sage-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-sage-blue" />
          </div>
          <p className="text-charcoal/60 text-base">
            Click &quot;Generate Insights&quot; to view your personalized AI summary and goals.
          </p>
        </div>
      )}
    </div>
  )
}
