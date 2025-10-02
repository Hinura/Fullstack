"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  birthdate?: string
  age?: number
}

interface UseBirthdateCheckProps {
  user: User | null
  redirectTo?: string
}

export function useBirthdateCheck({ user, redirectTo = "/dashboard" }: UseBirthdateCheckProps) {
  const [needsBirthdate, setNeedsBirthdate] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const hasIncompleteBirthdate = !user.birthdate || !user.age

      if (hasIncompleteBirthdate) {
        setNeedsBirthdate(true)
        if (redirectTo !== "/dashboard") {
          // Redirect to dashboard where birthdate setup will be shown
          router.push("/dashboard")
        }
      } else {
        setNeedsBirthdate(false)
      }
    }
  }, [user, router, redirectTo])

  return {
    needsBirthdate,
    canAccess: !needsBirthdate
  }
}