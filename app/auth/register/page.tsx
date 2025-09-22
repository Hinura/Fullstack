'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)

  const supabase = createClient()

  // Calculate age from birthdate
  const calculateAge = (birthdate: string): number => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!email || !password || !fullName || !birthdate) {
      setError('Please fill in all fields')
      return
    }

    const age = calculateAge(birthdate)
    if (age < 13) {
      setError('You must be at least 13 years old to create an account')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            birthdate: birthdate,
            age: age,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else if (data?.user) {
        // Check if user needs email confirmation
        if (!data.user.email_confirmed_at) {
          // Show email confirmation message instead of redirecting
          setShowEmailConfirmation(true)
          setIsLoading(false)
          return
        }

        // Profile is automatically created by database trigger
        // Redirect to dashboard after successful signup
        router.push('/dashboard/learn')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
      setError('Failed to sign up with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-green/5 to-coral/5">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-80 h-80 bg-coral/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sage-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-warm-green/15 rounded-full blur-3xl"></div>
      </div>

      <nav className="relative z-10 p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-base">Back to Home</span>
        </Link>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 py-8">
        <Card className="w-full max-w-lg shadow-2xl border-2 border-warm-green/20 bg-cream/95 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="space-y-6 text-center pb-10 pt-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warm-green to-coral flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <CardTitle className="text-4xl font-bold text-charcoal font-rounded">Create Account</CardTitle>
            <CardDescription className="text-lg text-charcoal/70 text-pretty leading-relaxed max-w-md mx-auto">
              Join Hinura and start your personalized learning journey today
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-10 px-10 pb-12">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {showEmailConfirmation && (
              <Alert className="border-blue-200 bg-blue-50">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <AlertDescription className="text-blue-700">
                  <div className="space-y-2">
                    <p className="font-semibold">Check your email!</p>
                    <p>We&apos;ve sent a confirmation link to <strong>{email}</strong>. Please click the link in your email to verify your account and complete the registration.</p>
                    <div className="pt-3">
                      <Button
                        onClick={() => router.push('/auth/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Go to Login
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignUp} className="space-y-8">
              <div className="space-y-4">
                <label htmlFor="fullName" className="text-base font-semibold text-charcoal">
                  Full Name
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-charcoal/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-14 h-14 text-lg border-2 border-warm-green/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="email" className="text-base font-semibold text-charcoal">
                  Email Address
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-charcoal/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-14 h-14 text-lg border-2 border-warm-green/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="birthdate" className="text-base font-semibold text-charcoal">
                  Date of Birth
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-charcoal/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    id="birthdate"
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="pl-14 h-14 text-lg border-2 border-warm-green/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 w-full focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="password" className="text-base font-semibold text-charcoal">
                  Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-charcoal/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-14 pr-14 h-14 text-lg border-2 border-warm-green/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-coral transition-colors duration-300"
                  >
                    {showPassword ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="confirmPassword" className="text-base font-semibold text-charcoal">
                  Confirm Password
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-charcoal/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-14 pr-14 h-14 text-lg border-2 border-warm-green/30 focus:border-coral rounded-2xl transition-all duration-300 bg-cream/50 placeholder:text-charcoal/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-charcoal/50 hover:text-coral transition-colors duration-300"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-sage-blue/10 rounded-2xl border-2 border-sage-blue/20">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-5 w-5 text-coral border-2 border-sage-blue/30 rounded-lg focus:ring-coral focus:ring-2 accent-coral"
                />
                <label htmlFor="terms" className="text-base text-charcoal/70 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-coral hover:text-warm-green font-semibold transition-colors duration-300 rounded px-1 hover:bg-coral/10"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-coral hover:text-warm-green font-semibold transition-colors duration-300 rounded px-1 hover:bg-coral/10"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-warm-green to-coral hover:from-warm-green/90 hover:to-coral/90 text-cream rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Your Account'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-sage-blue/20" />
              </div>
              <div className="relative flex justify-center text-base uppercase">
                <span className="bg-cream px-6 text-charcoal/60 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
                className="h-14 bg-cream border-2 border-sage-blue/30 hover:bg-sage-blue/10 hover:border-sage-blue/50 transition-all duration-300 hover:scale-105 rounded-2xl disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium text-charcoal">Google</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-14 bg-cream border-2 border-sage-blue/30 hover:bg-sage-blue/10 hover:border-sage-blue/50 transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                <svg className="h-6 w-6 mr-2 text-charcoal" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium text-charcoal">GitHub</span>
              </Button>
            </div>

            <div className="text-center">
              <p className="text-lg text-charcoal/70">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-coral hover:text-warm-green font-semibold transition-colors duration-300 rounded-full px-2 py-1 hover:bg-coral/10"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
