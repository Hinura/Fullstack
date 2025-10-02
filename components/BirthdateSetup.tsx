"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, AlertTriangle } from "lucide-react"

interface BirthdateSetupProps {
  onComplete: () => void
}

export default function BirthdateSetup({ onComplete }: BirthdateSetupProps) {
  const [birthdate, setBirthdate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!birthdate) {
      setError("Please enter your date of birth")
      return
    }

    const age = calculateAge(birthdate)
    if (age < 7) {
      setError("You must be at least 7 years old to use Hinura")
      return
    }

    if (age > 18) {
      setError("Hinura is designed for students aged 7-18")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/profile/set-birthdate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthdate: birthdate,
          age: age
        }),
      })

      if (response.ok) {
        onComplete()
      } else {
        const error = await response.json()
        setError(error.error || "Failed to save birthdate")
      }
    } catch (error) {
      console.error("Error saving birthdate:", error)
      setError("Error saving birthdate. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 7)

  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 18)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl border-0 bg-cream">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-coral/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Complete Your Profile</h2>
            <p className="text-charcoal/70">
              We need your date of birth to provide age-appropriate educational content tailored for students aged 7-18.
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-600 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="birthdate" className="text-charcoal font-semibold text-lg">
                Date of Birth
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="rounded-2xl bg-cream/80 border-sage-blue/30 focus:border-coral focus:ring-coral/20 text-lg py-3"
                min={minDate.toISOString().split("T")[0]}
                max={maxDate.toISOString().split("T")[0]}
                required
              />
              <p className="text-sm text-charcoal/60">
                Hinura is designed for students aged 7-18
              </p>
            </div>

            <Button
              type="submit"
              disabled={saving || !birthdate}
              className="w-full rounded-2xl bg-coral hover:bg-coral/90 text-cream py-3 text-lg font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Continue to Hinura"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-sage-blue/10 rounded-2xl">
            <p className="text-sm text-charcoal/70 text-center">
              <strong>Privacy Notice:</strong> Your date of birth is used only for age verification and providing appropriate content. It will not be shared with third parties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}