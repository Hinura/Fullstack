'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmailConfirmedPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/auth/login')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Email Confirmed!
        </h1>

        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now log in to start your learning journey with Hinura.
        </p>

        <Button
          onClick={() => router.push('/auth/login')}
          className="w-full"
          size="lg"
        >
          Continue to Login
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          You&apos;ll be automatically redirected in a few seconds
        </p>
      </div>
    </div>
  )
}
