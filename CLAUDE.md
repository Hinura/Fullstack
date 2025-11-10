# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hinura is an AI-driven gamified learning web platform for students aged 7-18, implementing adaptive learning algorithms and research-backed gamification. This is a Bachelor's thesis project in Software Engineering.

## Core Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom middleware
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Package Manager**: pnpm

### Key Architectural Patterns

1. **Supabase Client Architecture** - Three separate client configurations:
   - `lib/supabase/client.ts` - Browser client for client components
   - `lib/supabase/server.ts` - Server client with async cookie handling for server components
   - `lib/supabase/middleware.ts` - Middleware client for authentication flows

2. **Authentication Flow** - Email-based registration with confirmation:
   - Registration shows email confirmation alert (no immediate redirect)
   - Email verification handled by `/api/auth/callback/route.ts`
   - Successful verification redirects to `/dashboard/learn?welcome=true`
   - Database trigger automatically creates user profiles

3. **Route Structure**:
   - `/auth/*` - Authentication pages (login, register)
   - `/dashboard/*` - Protected dashboard pages (learn, profile, progress)
   - `/api/auth/callback` - Email verification endpoint

## Development Commands

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Development server runs on http://localhost:3000
```

## Database Schema

The `profiles` table structure has been updated from the original README:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  birthdate DATE,          -- Changed from age
  age INTEGER,             -- Calculated exact age
  points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important**: The schema stores exact `age` (integer) and `birthdate` (date), NOT age groups. The registration form calculates age from birthdate.

## Authentication Implementation Details

### Registration Flow
1. User enters birthdate (date input with min/max validation)
2. Age calculated client-side: `calculateAge(birthdate)` function
3. Minimum age validation: 13 years old
4. User metadata includes: `full_name`, `birthdate`, `age`
5. Email confirmation required before profile creation
6. Database trigger creates profile after email verification

### Client vs Server Components
- Auth pages use `'use client'` directive (React hooks)
- Login/register forms have password visibility toggles
- `useSearchParams` wrapped in `<Suspense>` boundaries
- Server components use async Supabase clients

## Common Issues & Solutions

### Next.js 15 Breaking Changes
- `cookies()` is now async - always `await cookies()`
- Use `'use client'` for pages with React hooks
- Wrap `useSearchParams` in Suspense boundaries

### Supabase Authentication
- Profile creation handled by database triggers, not manual API calls
- RLS policies require proper INSERT permissions for user profile creation
- Email confirmation flow uses callback route, not direct redirects

### Build Issues
If you encounter build errors:
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

## Critical Code Patterns

### Supabase Client Usage
```typescript
// Client components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server components/API routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // Note: async
```

### Age Calculation
```typescript
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
```

### Password Visibility Pattern
```typescript
const [showPassword, setShowPassword] = useState(false)

// In JSX:
<Input type={showPassword ? "text" : "password"} />
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
</button>
```

## Environment Setup

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Important Notes

- Always run type checking and linting before commits
- The project uses research-backed adaptive learning algorithms (mentioned in README)
- Age validation enforces minimum 13 years for COPPA compliance
- Email confirmation is required for all registrations
- Profile creation happens automatically via database triggers
- Use exact age values, not age groups in all new code