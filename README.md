## 📚 **Comprehensive README.md**

Create `README.md` in your root directory:

```markdown
# 🎮 AI-Driven Gamified Learning Web Platform

An adaptive educational platform for learners aged 7-18, implementing research-backed gamification and personalized learning algorithms.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Adaptive Algorithm](#adaptive-algorithm)
- [Gamification System](#gamification-system)
- [Research Foundation](#research-foundation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Team Members](#team-members)
- [Timeline](#timeline)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

**Thesis Project** - Bachelor's Degree in Software Engineering  
**Duration**: September 9 - December 1, 2024 (12 weeks)  
**Team Size**: 3 members

### Problem Statement
Traditional e-learning platforms fail to adapt to individual learner needs, leading to disengagement through content that is either too difficult (causing frustration) or too easy (causing boredom).

### Solution
An adaptive learning platform that:
- Adjusts difficulty based on performance (Zone of Proximal Development theory)
- Implements research-backed gamification elements
- Provides immediate feedback (<200ms response time)
- Supports learners aged 7-18 with age-appropriate interfaces

## ✨ Features

### Core Features (MVP)
- [x] User authentication and profiles
- [x] Adaptive difficulty algorithm
- [x] Exercise delivery system
- [x] Points and scoring system
- [x] Progress tracking
- [x] Basic badges (3 types)
- [ ] 50+ mathematics exercises
- [ ] Performance visualization

### Adaptive System
- Performance-based difficulty adjustment
- Thresholds: >80% (advance), <40% (reduce)
- Weighted recent performance tracking
- Based on Corbett & Anderson (1994) knowledge tracing

### Gamification Elements
- **Points**: 10 for correct, 5 with hint, +5 streak bonus
- **Badges**: First Steps, Week Warrior, Level Up
- **Progress**: Visual progress bars and level indicators
- **Streaks**: Consecutive correct answer tracking

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Backend
- **API**: Next.js Route Handlers (serverless)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Subscriptions
- **AI (Optional)**: Anthropic Claude API

### Infrastructure
- **Hosting**: Vercel (serverless functions)
- **Database**: Supabase (free tier)
- **Version Control**: Git/GitHub
- **Package Manager**: pnpm

## 📁 Project Structure

hinura/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── learn/
│   │   │   └── page.tsx
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── adapt/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── exercises/
│   │   │   └── route.ts
│   │   └── progress/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── exercises/
│   ├── gamification/
│   ├── layout/
│   └── ui/           (shadcn components)
├── lib/
│   ├── adaptive/
│   │   └── algorithm.ts
│   ├── gamification/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils/
│       └── cn.ts
├── constants/
│   └── gamification.ts
├── hooks/
├── types/
│   ├── database.ts
│   └── index.ts
├── public/
├── .env.local
├── middleware.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-team/Hinura.git
cd Hinura
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. **Set up Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Copy the project URL and anon key to `.env.local`
- Run the schema SQL (see Database Schema section)

5. **Run development server**
```bash
pnpm dev
# Open http://localhost:3000
```

## 💻 Development Guide

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm type-check   # TypeScript type checking
```

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules
- Format with Prettier before committing
- Use conventional commits

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
git add .
git commit -m "feat: add new feature"
git push origin feature/feature-name
# Create PR for review
```

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

## 🔐 Environment Variables

Create `.env.local` with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic AI (Optional)
ANTHROPIC_API_KEY=sk-ant-...

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄 Database Schema

### Core Tables

#### `profiles`
```sql
- id: UUID (references auth.users)
- username: TEXT
- full_name: TEXT
- age_group: ENUM ('7-9', '10-12', '13-15', '16-18')
- points: INTEGER
- current_level: INTEGER
- streak_days: INTEGER
```

#### `exercises`
```sql
- id: UUID
- question: TEXT
- options: JSONB (array of strings)
- correct_answer: INTEGER
- difficulty: INTEGER (1-3)
- subject: TEXT
- skill_tag: TEXT
- hint_text: TEXT
- explanation: TEXT
```

#### `user_progress`
```sql
- id: UUID
- user_id: UUID (references auth.users)
- exercise_id: UUID (references exercises)
- completed_at: TIMESTAMP
- is_correct: BOOLEAN
- time_taken: INTEGER
- points_earned: INTEGER
```

#### `adaptive_state`
```sql
- user_id: UUID (references auth.users)
- current_difficulty: INTEGER
- performance_history: JSONB
- last_exercise_id: UUID
- exercises_completed: INTEGER
```

### Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- See full schema in /supabase/schema.sql
```

## 📡 API Documentation

### Authentication

#### POST `/api/auth/register`
```typescript
// Request
{
  email: string
  password: string
  age_group: '7-9' | '10-12' | '13-15' | '16-18'
}

// Response
{
  user: User
  session: Session
}
```

#### POST `/api/auth/login`
```typescript
// Request
{
  email: string
  password: string
}

// Response
{
  user: User
  session: Session
}
```

### Exercises

#### GET `/api/exercises`
```typescript
// Query params
?difficulty=1&limit=10

// Response
{
  exercises: Exercise[]
}
```

#### POST `/api/exercises/submit`
```typescript
// Request
{
  exercise_id: string
  answer: number
  time_taken: number
}

// Response
{
  correct: boolean
  points_earned: number
  explanation: string
}
```

### Adaptive Algorithm

#### POST `/api/adapt`
```typescript
// Request
{
  user_id: string
  performance_history: boolean[]
}

// Response
{
  next_difficulty: number
  next_exercise: Exercise
  performance_score: number
}
```

## 🧮 Adaptive Algorithm

### Core Algorithm
```typescript
// Based on research: Corbett & Anderson (1994), Vygotsky (1978)

1. Calculate Performance (last 5 exercises)
   - Weighted average: [0.1, 0.15, 0.2, 0.25, 0.3]
   - Recent attempts weighted more heavily

2. Adjust Difficulty
   - Performance >= 80% → Increase difficulty
   - Performance < 40% → Decrease difficulty  
   - 40-80% → Maintain current level

3. Select Next Exercise
   - Filter by difficulty level
   - Exclude recently completed
   - Apply spaced repetition
```

### Research Foundation
- **Zone of Proximal Development** (Vygotsky, 1978)
- **Knowledge Tracing** (Corbett & Anderson, 1994)
- **Optimal Challenge** (Corbalan et al., 2008)

## 🎮 Gamification System

### Point Calculation
```typescript
const POINTS = {
  CORRECT_ANSWER: 10,      // Base points
  WITH_HINT: 5,            // Reduced for hint use
  STREAK_BONUS: 5,         // Consecutive correct
  SPEED_BONUS: 3,          // Under 30 seconds
}
```

### Badge System
| Badge | Requirement | Description |
|-------|------------|-------------|
| First Steps | 10 exercises | Complete first 10 exercises |
| Week Warrior | 7-day streak | Login and practice for 7 days |
| Level Up | Reach level 2 | Advance to difficulty 2 |
| Perfect Ten | 10 correct | Get 10 correct in a row |
| Speed Demon | 5 fast answers | Answer 5 under 30s |

### Research Backing
- **Immediate Feedback** (Hattie & Timperley, 2007)
- **Variable Rewards** (Skinner, 1950)
- **Goal Setting Theory** (Locke & Latham, 2002)

## 📚 Research Foundation

### Key Papers
1. Vygotsky, L. (1978). *Mind in Society* - Zone of Proximal Development
2. Hamari, J. et al. (2014). *Does gamification work?* - Meta-analysis
3. Hattie, J. & Timperley, H. (2007). *The power of feedback*
4. Corbett, A. & Anderson, J. (1994). *Knowledge tracing*
5. Ryan, R. & Deci, E. (2000). *Self-determination theory*

### Design Principles
- Maintain optimal challenge (70-80% success rate)
- Provide immediate feedback (<200ms)
- Use progressive difficulty
- Implement variable reward schedules

## 🧪 Testing

### Run Tests
```bash
pnpm test           # Run all tests
pnpm test:unit      # Unit tests only
pnpm test:e2e       # E2E tests
```

### Test Coverage
- Adaptive algorithm: Unit tests
- API routes: Integration tests
- UI components: Component tests
- User flows: E2E tests

## 🚢 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Setup
1. Add environment variables in Vercel dashboard
2. Connect GitHub repository
3. Enable automatic deployments

### Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- API Response Time: <200ms
- Lighthouse Score: >90

## 👥 Team Members

| Role | Responsibilities | GitHub |
|------|-----------------|--------|
| Member 1 | Frontend, UI/UX, Gamification | @username1 |
| Member 2 | Backend, Adaptive Algorithm, Database | @username2 |
| Member 3 | Content, Testing, Documentation | @username3 |

## 📅 Timeline

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup
- [x] Authentication system
- [ ] Basic UI components
- [ ] Database schema

### Phase 2: Core Features (Weeks 4-7)
- [ ] Exercise system
- [ ] Adaptive algorithm
- [ ] Gamification elements
- [ ] Progress tracking

### Phase 3: Polish (Weeks 8-10)
- [ ] Performance optimization
- [ ] Testing
- [ ] UI polish
- [ ] Bug fixes

### Phase 4: Documentation (Weeks 11-12)
- [ ] Thesis writing
- [ ] Code documentation
- [ ] Demo preparation
- [ ] Final submission

## 🔧 Troubleshooting

### Common Issues

#### Supabase Connection Error
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify Supabase project is running
# Check Supabase dashboard for status
```

#### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Type Errors
```bash
# Regenerate types from Supabase
pnpm db:types
```

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'true')
```

## 📝 Contributing

1. Follow the code style guide
2. Write tests for new features
3. Update documentation
4. Create detailed PR descriptions
5. Request review from team members

## 📄 License

This project is part of an academic thesis and is not licensed for commercial use.

---

## 🆘 Support

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Contact
- Project Supervisor: [supervisor@university.edu]
- Team Email: [team@university.edu]

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Status**: In Development
```

This comprehensive README includes:
- ✅ Complete project overview
- ✅ Setup instructions
- ✅ API documentation
- ✅ Database schema
- ✅ Algorithm explanation
- ✅ Research references
- ✅ Team organization
- ✅ Timeline/milestones
- ✅ Troubleshooting guide
- ✅ Development workflow

Save this as `README.md` in your project root. This will be invaluable for your team members and for your thesis documentation!