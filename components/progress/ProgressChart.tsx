'use client'

import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ProgressChartProps {
  chartData: Array<{
    date: string
    math: number | null
    english: number | null
    science: number | null
  }>
}

const chartConfig = {
  math: {
    label: 'Math',
    color: '#ff6b6b', // coral
  },
  english: {
    label: 'English',
    color: '#4ecdc4', // sage-blue
  },
  science: {
    label: 'Science',
    color: '#45b7d1', // warm-green
  },
} satisfies ChartConfig

export default function ProgressChart({ chartData }: ProgressChartProps) {
  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <Card className="bg-cream/95 dark:bg-dark-surface border-2 border-sage-blue/20 shadow-soft rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-charcoal dark:text-charcoal flex items-center">
                <TrendingUp className="h-8 w-8 text-coral mr-3" />
                Performance Growth
              </CardTitle>
              <CardDescription className="text-charcoal/70 dark:text-charcoal/70 text-base mt-2">
                Track your scores per subject over time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--sage-blue) / 0.2)"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--charcoal))', fontSize: 12 }}
                className="dark:[&_text]:fill-white"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--charcoal))', fontSize: 12 }}
                className="dark:[&_text]:fill-white"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="math"
                type="monotone"
                stroke="var(--color-math)"
                strokeWidth={3}
                dot={{
                  fill: 'var(--color-math)',
                  className: 'dark:fill-white',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls
              />
              <Line
                dataKey="english"
                type="monotone"
                stroke="var(--color-english)"
                strokeWidth={3}
                dot={{
                  fill: 'var(--color-english)',
                  className: 'dark:fill-white',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls
              />
              <Line
                dataKey="science"
                type="monotone"
                stroke="var(--color-science)"
                strokeWidth={3}
                dot={{
                  fill: 'var(--color-science)',
                  className: 'dark:fill-white',
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
