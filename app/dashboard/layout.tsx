import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardProviders } from '@/components/gamification/DashboardProviders'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <DashboardProviders>
      {children}
    </DashboardProviders>
  )
}