'use client'

import { ReactNode } from 'react'
import { AchievementProvider } from './AchievementProvider'

interface DashboardProvidersProps {
  children: ReactNode
}

export function DashboardProviders({ children }: DashboardProvidersProps) {
  return (
    <AchievementProvider autoCloseDelay={5000}>
      {children}
    </AchievementProvider>
  )
}
