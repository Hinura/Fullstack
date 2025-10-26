'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

function SignInContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [message, setMessage] = useState<string | null>(searchParams.get('message'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
      } else if (data?.user) {
        // Ensure session is fully refreshed before redirect
        await supabase.auth.getSession()
        // Wait for cookies to be set properly in production
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Use replace to prevent back button issues
        window.location.replace('/dashboard/learn')
        // Keep loading state true during redirect
      }
    } catch {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Failed to login with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <header className="border-b border-sage-blue/20 bg-cream/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-medium">Back to home</span>
            </Link>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral to-sage-blue flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-charcoal font-rounded">Hinura</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="w-full max-w-lg">
            <Card className="shadow-2xl border-2 border-sage-blue/20 bg-cream/95 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardHeader className="space-y-6 text-center pb-10 pt-12">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage-blue to-warm-green flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-4xl font-bold text-balance text-charcoal font-rounded">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-lg text-charcoal/70 text-pretty leading-relaxed max-w-md mx-auto">
                  Sign in to your Hinura account to continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 px-10 pb-12">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}
                {message && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{message}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleEmailLogin} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-base font-semibold text-charcoal">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-lg border-2 border-sage-blue/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-base font-semibold text-charcoal">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 text-lg border-2 border-sage-blue/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50 pr-14"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-4 hover:bg-transparent rounded-2xl"
                      >
                        {showPassword ? (
                          <svg
                            className="h-6 w-6 text-charcoal/50 hover:text-coral transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-6 w-6 text-charcoal/50 hover:text-coral transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-5 w-5 rounded-lg border-2 border-sage-blue/30 text-coral focus:ring-coral focus:ring-2 accent-coral"
                      />
                      <label htmlFor="remember" className="text-base font-medium text-charcoal/70">
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-base font-medium text-coral hover:text-warm-green transition-colors duration-300 rounded-full px-3 py-1 hover:bg-coral/10"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-coral to-warm-green hover:from-coral/90 hover:to-warm-green/90 text-cream rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in to your account'
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-sage-blue/20" />
                  </div>
                  <div className="relative flex justify-center text-base uppercase">
                    <span className="bg-cream px-6 text-charcoal/60 font-medium">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full h-14 bg-cream border-2 border-sage-blue/30 hover:bg-sage-blue/10 hover:border-sage-blue/50 transition-all duration-300 hover:scale-105 rounded-2xl disabled:opacity-50"
                >
                  <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isGoogleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="font-medium text-charcoal">Google</span>
                  )}
                </Button>

                <div className="text-center text-lg text-charcoal/70">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-coral hover:text-warm-green font-semibold transition-colors duration-300 rounded-full px-2 py-1 hover:bg-coral/10"
                  >
                    Sign up for free
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
