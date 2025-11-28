## 📚 **Comprehensive README.md**

Create `README.md` in your root directory:


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
**Duration**: September 9 - November 28, 2025 (12 weeks)  
**Team Size**: 2 members

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
- [x] User authentication with email confirmation
- [x] User profiles with automatic creation via database triggers
- [x] Adaptive difficulty algorithm
- [x] Exercise delivery system
- [x] Points and scoring system
- [x] Progress tracking
- [x] Basic badges (3 types)
- [x] Mathematics exercises
- [ ] Performance visualization

### Adaptive System
- Performance-based difficulty adjustment
- Thresholds: >80% (advance), <40% (reduce)
- Weighted recent performance tracking
- Based on Corbett & Anderson (1994) knowledge tracing

### Gamification Elements (Research-Backed)
- **Points System**: Dynamic XP with streak and level multipliers (up to 1.95x combined)
- **12 Achievement Badges**: Persistence, Milestone, Mastery, and Exploration categories
- **Streak System**: Daily activity tracking with freeze protection (1 per week)
- **Subject-Specific Levels**: Math, English, Science progression (sqrt-based formula)
- **Progress Visualization**: Real-time dashboards, progress bars, countdown timers
- **Transaction Logging**: Complete audit trail of all point changes and multipliers

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Backend
- **API**: Next.js Route Handlers (serverless)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Subscriptions
- **AI (Optional)**: Open ai 4o-mini

### Infrastructure
- **Hosting**: Vercel (serverless functions)
- **Database**: Supabase (free tier)
- **Version Control**: Git/GitHub
- **Package Manager**: pnpm

## 🎮 Gamification System (Comprehensive)

### Points & XP System

#### Base Points Structure
- **Correct Answer**: 10 XP
- **Quiz Completion**: 20 XP
- **Perfect Score Bonus**: +50 XP (100% accuracy)

#### Dynamic Multiplier System
**Total Multiplier** = Streak Multiplier × Level Multiplier (Max: 1.5 × 1.3 = 1.95x)

**Streak Multipliers:**
| Streak Days | Multiplier | Example (10 XP base) |
|-------------|-----------|----------------------|
| 0-2 days | 1.0x | 10 XP |
| 3-6 days | 1.1x | 11 XP |
| 7-13 days | 1.2x | 12 XP |
| 14-29 days | 1.3x | 13 XP |
| 30-59 days | 1.4x | 14 XP |
| 60+ days | 1.5x | 15 XP |

**Level Multipliers (per subject):**
| Level | Multiplier | Example (10 XP base) |
|-------|-----------|----------------------|
| 1-2 | 1.0x | 10 XP |
| 3-4 | 1.1x | 11 XP |
| 5-6 | 1.2x | 12 XP |
| 7+ | 1.3x | 13 XP |

#### Transaction Types
All point changes are logged in `point_transactions` table:
- `quiz_correct` - Correct answer points
- `quiz_partial` - Partial credit
- `quiz_completion` - Quiz finished bonus
- `streak_bonus` - Streak milestone reached
- `level_up` - Subject level increased
- `achievement_unlock` - Badge earned
- `perfect_score` - 100% accuracy bonus

### Achievement System (12 Badges)

#### 🏃 Persistence Badges (Effort-Based)
| Badge | XP | Requirement |
|-------|-----|------------|
| **First Steps** | 50 | Complete first quiz |
| **3-Day Scholar** | 75 | Maintain 3-day streak |
| **Week Warrior** | 150 | Maintain 7-day streak |
| **Monthly Master** | 500 | Maintain 30-day streak |

#### 🎯 Milestone Badges (Achievement-Based)
| Badge | XP | Requirement |
|-------|-----|------------|
| **Assessment Master** | 150 | Complete initial assessment |
| **Dedicated Learner** | 100 | Complete 10 quizzes |
| **Quiz Champion** | 300 | Complete 50 quizzes |

#### 🏆 Mastery Badges (Skill-Based)
| Badge | XP | Requirement |
|-------|-----|------------|
| **Math Champion** | 200 | Reach Level 5 in Math |
| **Reading Master** | 200 | Reach Level 5 in English |
| **Science Genius** | 200 | Reach Level 5 in Science |
| **Perfect Score** | 100 | Complete quiz with 100% |

#### 🌟 Exploration Badges (Discovery-Based)
| Badge | XP | Requirement |
|-------|-----|------------|
| **Well-Rounded** | 100 | Complete quizzes in all 3 subjects |

### Streak System

#### Core Mechanics
- **Activity Definition**: Complete at least 1 quiz question per day
- **Midnight Reset**: Streak must be maintained before midnight (local time)
- **Personal Best**: Tracks highest streak ever achieved
- **Milestone Bonuses**: Extra XP at 3, 7, 14, 30, 60, 100 day milestones

#### Streak Milestones & Rewards
| Milestone | Bonus XP | Badge Unlocked |
|-----------|---------|----------------|
| 3 days | 75 XP | 3-Day Scholar |
| 7 days | 150 XP | Week Warrior |
| 14 days | 300 XP | - |
| 30 days | 500 XP | Monthly Master |
| 60 days | 750 XP | - |
| 100 days | 1,500 XP | - |

#### Streak Freeze Protection
- **Availability**: 1 freeze per week (resets every Monday)
- **Auto-Apply**: Automatically uses freeze if you miss exactly 1 day
- **Purpose**: Prevents streak reset for occasional missed days
- **Tracking**: `streak_freeze_available` flag in database

#### UI Features
- Real-time countdown timer to midnight
- Fire emoji streak indicator (🔥)
- Freeze status badge
- Personal best display
- Visual progress bar

### Level System

#### Level Formula (Square Root Based)
```
Level = floor(sqrt(points / 100)) + 1
```

#### XP Requirements Per Level
| Level | Total XP Required | XP from Previous Level |
|-------|------------------|----------------------|
| 1 | 0 | - |
| 2 | 100 | 100 |
| 3 | 400 | 300 |
| 4 | 900 | 500 |
| 5 | 1,600 | 700 |
| 6 | 2,500 | 900 |
| 7 | 3,600 | 1,100 |
| 8 | 4,900 | 1,300 |
| 9 | 6,400 | 1,500 |
| 10 | 8,100 | 1,700 |

#### Subject-Specific Progression
Each subject (Math, English, Science) has independent:
- **Points**: `math_points`, `english_points`, `science_points`
- **Levels**: `math_level`, `english_level`, `science_level`
- **Level History**: Tracked in `level_history` table

#### Level-Up Rewards
- **Bonus XP**: 50 XP × new level
  - Level 2 → 100 XP bonus
  - Level 5 → 250 XP bonus
  - Level 10 → 500 XP bonus
- **Achievement Check**: Triggers mastery badge checks
- **UI Celebration**: Level-up modal with confetti animation

### Gamification UI Components

#### Dashboard Components (7 total)
1. **ProfileSummaryCard** - Overall level, total XP, next level progress
2. **StreakTrackerCard** - Current streak, countdown timer, freeze status
3. **SubjectProgressGrid** - Math/English/Science level cards with progress bars
4. **AchievementShowcase** - Badge gallery (earned vs locked states)
5. **RecentAchievementsCard** - Latest 5 unlocked achievements
6. **AchievementUnlockModal** - Celebration modal with confetti on unlock
7. **LevelUpModal** - Level-up notification with rewards display

### Gamification API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gamification/award-points` | POST | Award points with multipliers |
| `/api/gamification/check-achievements` | POST | Check for new unlocked badges |
| `/api/gamification/update-streak` | POST | Update daily streak (called on quiz completion) |

### Research Foundation

The gamification system is based on established research:

1. **Self-Determination Theory** (Ryan & Deci, 2000)
   - Autonomy: Choice of subjects and difficulty
   - Competence: Leveling system and mastery badges
   - Relatedness: Achievement sharing (future)

2. **Variable Reward Schedules** (Skinner, 1950)
   - Unpredictable achievement unlocks
   - Streak milestone bonuses
   - Random perfect score opportunities

3. **Goal-Setting Theory** (Locke & Latham, 2002)
   - Specific goals: Streak milestones, level targets
   - Challenging but achievable: Adaptive difficulty
   - Feedback: Immediate progress updates

4. **Growth Mindset** (Dweck, 2006)
   - Effort-based rewards (persistence badges)
   - Progress over perfection
   - Mistakes as learning opportunities

## 🤖 AI Integration (OpenAI-Powered)

### AI Service: OpenAI GPT-4o-mini

The platform uses **OpenAI's GPT-4o-mini** model for all AI features, providing:
- Cost-effective AI responses
- Fast generation times (<2 seconds average)
- Age-appropriate content (7-18 years)
- Growth mindset language

### AI-Powered Features (4 Core Features)

#### 1. Real-Time Hint Generation
**Endpoint**: `POST /api/ai/hint`

**Features:**
- Context-aware 1-2 sentence hints
- **Never reveals the answer** - guides thinking instead
- Age-appropriate language (7-18)
- Subject and difficulty-aware
- Suggests first step or subproblem approach

**Technical Details:**
- **Model**: gpt-4o-mini with temperature 0.2 (consistent responses)
- **Max Tokens**: 200 (configurable via `OPENAI_MAX_TOKENS_HINT`)
- **Rate Limiting**: 30 hints per 60 seconds per IP
- **Caching**: 5-minute TTL for identical questions (performance optimization)
- **Response Format**: JSON mode for structured outputs

**Example Hint:**
```
Question: "What is 15 × 12?"
Hint: "Try breaking 12 into 10 + 2, then multiply 15 by each part separately."
```

#### 2. Answer Explanation Generation
**Endpoint**: `POST /api/ai/explain`

**Features:**
- Personalized explanations (knows correct answer AND student's wrong answer)
- Shows key steps for math problems
- Cites relevant phrases for reading comprehension
- Includes "Quick check" self-assessment line
- Max 120 words per explanation

**Technical Details:**
- **Model**: gpt-4o-mini with temperature 0.2
- **Max Tokens**: 300 (configurable via `OPENAI_MAX_TOKENS_EXPLAIN`)
- **Rate Limiting**: 20 explanations per 60 seconds per IP
- **No Caching**: Explanations are personalized to student's answer
- **Response Format**: JSON mode

**Example Explanation:**
```
Question: "What is 15 × 12?"
Student answered: 150
Explanation: "You might have multiplied 15 × 10 = 150, but forgot the extra 2.
15 × 12 = (15 × 10) + (15 × 2) = 150 + 30 = 180.
Quick check: Does 12 groups of 15 equal 180? Yes! ✓"
```

#### 3. Personalized Study Recommendations
**Endpoint**: `POST /api/ai/recommendations`

**Features:**
- Analyzes last 12 quiz attempts
- Considers subject skill levels (1-5 scale)
- Generates 2-3 specific practice suggestions
- Shows: Subject + Difficulty + Reason
- Motivational, age-appropriate language

**Technical Details:**
- **Model**: gpt-4o-mini with temperature 0.2-0.3 (varies by origin)
- **Max Tokens**: 350 (configurable via `OPENAI_MAX_TOKENS_SUMMARY`)
- **Rate Limiting**: 10 requests per 60 seconds per IP
- **Authentication**: Requires logged-in user
- **Data Sources**:
  - User age
  - Math/English/Science levels
  - Recent quiz scores and dates

**Example Recommendation:**
```
1. Math (Medium) - You're doing great with addition! Try some medium
   multiplication to build on that strength.
2. Science (Easy) - Let's review plants and animals with some fun easy
   quizzes to boost your confidence.
```

#### 4. Learning Insights & Goal Setting
**Endpoint**: `POST /api/ai/insights`

**Features:**
- Growth mindset-focused feedback (**no "you're smart" praise**)
- Acknowledges challenges positively
- Two specific, achievable, process-focused goals
- 80-120 word summary
- Age-appropriate tone guidelines

**Technical Details:**
- **Model**: gpt-4o-mini with temperature 0.2
- **Max Tokens**: 350
- **Rate Limiting**: 8 requests per 60 seconds per IP
- **Tone Variations**:
  - Ages 7-12: Warm, friendly, enthusiastic
  - Ages 13-15: Respectful, encouraging
  - Ages 16-18: Mature but not condescending

**Example Insight:**
```
Summary: You've practiced consistently this week, especially in math!
Your effort on medium questions shows you're ready for new challenges.
English quizzes are improving with each try—keep that momentum going!

Goals:
1. Try 3 medium science quizzes this week to expand your knowledge
2. Practice one hard math quiz to challenge yourself
```

### AI Safety & Performance

#### Rate Limiting (Per IP Address)
| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/ai/hint` | 30 | 60s | Prevent hint spam |
| `/api/ai/explain` | 20 | 60s | Moderate API costs |
| `/api/ai/recommendations` | 10 | 60s | Protect expensive queries |
| `/api/ai/insights` | 8 | 60s | Limit dashboard requests |

#### Caching Strategy
- **Hints**: 5-minute cache (identical questions return cached hints)
- **Explanations**: No caching (personalized to student's answer)
- **Recommendations**: No caching (based on recent performance)
- **Insights**: No caching (real-time data analysis)

#### Token Management
```typescript
// Hard cap enforcement
function hardCapTokens(requested: number, envVar: string, absolute: number): number
```
- Environment variables can override request tokens
- Absolute maximum enforced (200-350 tokens depending on endpoint)
- Prevents runaway costs

#### Response Validation
- All AI responses use JSON mode: `response_format: { type: "json_object" }`
- Guaranteed structured responses
- Error handling for malformed outputs

### AI Implementation Files

**Core AI Infrastructure:**
- `/lib/ai/openai.ts` - OpenAI client configuration
- `/lib/ai/prompts.ts` - System prompts for all AI features
- `/lib/ai/guard.ts` - Rate limiting and caching utilities

**API Routes:**
- `/app/api/ai/hint/route.ts` - Hint generation
- `/app/api/ai/explain/route.ts` - Explanation generation
- `/app/api/ai/recommendations/route.ts` - Study recommendations
- `/app/api/ai/insights/route.ts` - Learning insights

**Frontend Integration:**
- `/app/dashboard/practice/page.tsx` - Lines 205-261 (hint & explanation buttons)
- `/app/dashboard/learn/page.tsx` - Lines 28-45 (recommendations display)
- `/app/dashboard/progress/page.tsx` - Lines 209-272 (insights generation)

### Growth Mindset Philosophy

All AI-generated content follows research-backed principles:

**What We DO:**
- Praise effort, strategies, and persistence
- Acknowledge challenges as learning opportunities
- Focus on process over outcomes
- Provide specific, actionable feedback

**What We DON'T DO:**
- Praise intelligence ("you're so smart!")
- Fixed mindset language ("you're naturally good at math")
- Vague praise ("good job!")
- Comparison to others

**Research Foundation:**
- Dweck, C. (2006). *Mindset: The New Psychology of Success*
- Hattie, J. & Timperley, H. (2007). *The Power of Feedback*
- Kluger, A. & DeNisi, A. (1996). *The effects of feedback interventions on performance*

## 📚 Exercise System & Adaptive Learning

### Exercise Structure

#### Subjects & Content
The platform covers **3 core subjects**:

| Subject | Icon | Focus Areas | Question Types |
|---------|------|-------------|----------------|
| **Math** | 🔢 | Arithmetic, Algebra, Geometry, Word Problems | Calculations, Problem-solving |
| **English** | 📚 | Reading Comprehension, Vocabulary, Grammar | Text analysis, Word meaning |
| **Science** | 🔬 | Biology, Chemistry, Physics, Earth Science | Concepts, Experiments |

#### Difficulty Levels
| Level | Description | Target Age | Characteristics |
|-------|------------|-----------|-----------------|
| **Easy** | Foundation | 7-10 | Basic concepts, simple problems |
| **Medium** | Intermediate | 10-14 | Multi-step problems, applied concepts |
| **Hard** | Advanced | 14-18 | Complex reasoning, synthesis |
| **Adaptive** | Personalized | All ages | EDL-optimized (see below) |

#### Question Format
- **Type**: Multiple choice (4 options: A, B, C, D)
- **Structure**: Question text + 4 options + correct answer index
- **Metadata**: Subject, difficulty, target age range, tags
- **AI Support**: Hints and explanations generated on-demand

#### Quiz Types
1. **Assessment** (7 questions per subject = 21 total)
   - Required before first practice
   - Fixed distribution: 2 easy, 3 medium, 2 hard
   - Establishes baseline for EDL system
   - Initializes `user_performance_metrics`

2. **Practice** (10 questions)
   - Adaptive difficulty using EDL algorithm
   - Personalized question selection
   - Real-time hints and explanations available
   - Points, XP, and streaks earned

### EDL Algorithm (Education Difficulty Level)

The **EDL (Education Difficulty Level)** system is the core adaptive learning algorithm that personalizes question difficulty based on performance.

#### Core Concept: Effective Age
```
Effective Age = Chronological Age + Performance Adjustment
```

- **Chronological Age**: User's actual age (13-18)
- **Performance Adjustment**: -2 to +2 based on recent accuracy
- **Effective Age**: Age used for question selection in adaptive mode

#### Performance Adjustment Calculation

**Based on Recent Accuracy** (last 10 quiz attempts per subject):

| Accuracy Range | Adjustment | Meaning |
|----------------|-----------|---------|
| 90%+ | +2 | Exceptional - challenge more |
| 76-89% | +1 | Approaching mastery |
| 60-75% | 0 | Flow zone (optimal) |
| 50-59% | -1 | Challenging - support needed |
| <50% | -2 | Struggling - reduce difficulty |

#### EDL Status Categories

1. **Exceptional** (≥90%)
   - High mastery, ready for advanced content
   - Boost effective age by +2

2. **Approaching Mastery** (76-89%)
   - Strong performance, challenge increase recommended
   - Boost effective age by +1

3. **Flow Zone** (60-75%) ⭐ **OPTIMAL**
   - Perfect challenge level (Zone of Proximal Development)
   - Maintain current difficulty (adjustment = 0)

4. **Challenging** (50-59%)
   - Struggling but learning
   - Reduce effective age by -1

5. **Struggling** (<50%)
   - Significant difficulty, needs easier content
   - Reduce effective age by -2

#### Difficulty Distribution Algorithm

The system dynamically adjusts the mix of easy/medium/hard questions based on performance:

**High Performers (≥75% accuracy):**
```
20% Easy + 30% Medium + 50% Hard = Challenge-focused
```

**Flow Zone (60-74% accuracy):**
```
30% Easy + 40% Medium + 30% Hard = Balanced
```

**Struggling (<60% accuracy):**
```
50% Easy + 30% Medium + 20% Hard = Support-focused
```

**New Users (no history):**
```
30% Easy + 40% Medium + 30% Hard = Baseline
```

#### Question Selection Process (5 Steps)

**Step 1: Determine Target Age**
```typescript
if (mode === 'adaptive') {
  targetAge = effectiveAge  // Use performance-adjusted age
} else {
  targetAge = chronologicalAge  // Use actual age
}
```

**Step 2: Calculate Difficulty Distribution**
```typescript
const distribution = calculateDistribution(recentAccuracy)
// Returns: { easy: %, medium: %, hard: % }
```

**Step 3: Filter Available Questions**
- Match subject
- Match target age range
- Exclude questions answered in last 30 days (prevent repetition)

**Step 4: Apply Difficulty Distribution**
- Sample questions according to calculated percentages
- Randomize within each difficulty tier

**Step 5: Shuffle & Return**
- Final randomization for variety
- Return 10 questions for practice, 7 for assessment

#### EDL Metrics Tracking

Database table: `user_performance_metrics`

| Field | Purpose |
|-------|---------|
| `effective_age` | Current adjusted age for question selection |
| `performance_adjustment` | -2 to +2 adjustment value |
| `edl_status` | exceptional/approaching_mastery/flow_zone/challenging/struggling |
| `recent_accuracy` | Average accuracy from last 10 quizzes |
| `quizzes_completed` | Total quizzes for this subject |
| `last_updated` | Timestamp of last recalculation |

**Recalculation Trigger**: After every quiz submission

#### EDL API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/edl/status` | GET | Fetch current EDL metrics for all subjects |
| `GET /api/questions?mode=adaptive` | GET | Get EDL-optimized question set |
| `POST /api/quiz-attempts` | POST | Submit quiz + update EDL metrics |

### Answer Validation & Scoring

#### Client-Side Validation
- Real-time feedback (✅ correct, ❌ incorrect)
- Immediate UI updates
- Local answer storage before submission

#### Server-Side Validation
```typescript
// Quiz scoring
score_percentage = (correct_answers / total_questions) × 100

// Perfect score bonus
if (score_percentage === 100) {
  bonus_xp += 50
}
```

#### Points Calculation (with Gamification)
```typescript
// Base points
base_points = (correct_answers × 10) + 20  // 10 per correct + 20 completion

// Apply multipliers
streak_multiplier = getStreakMultiplier(streak_days)
level_multiplier = getLevelMultiplier(subject_level)
final_points = base_points × streak_multiplier × level_multiplier

// Perfect score bonus
if (score_percentage === 100) {
  final_points += 50
}
```

### Assessment System

#### Purpose
- Establish baseline performance for each subject
- Initialize EDL metrics
- Required before first practice quiz
- One-time per user

#### Structure
- **Total Questions**: 21 (7 per subject × 3 subjects)
- **Distribution per Subject**: 2 easy, 3 medium, 2 hard
- **No Hints**: Assessment measures true baseline
- **No Time Limit**: Focus on accuracy, not speed

#### Post-Assessment
- Creates entries in `user_performance_metrics` for all 3 subjects
- Sets initial `effective_age = chronological_age`
- Calculates initial EDL status
- Unlocks practice mode
- Awards "Assessment Master" badge (150 XP)

### Exercise Database Schema

#### `questions` Table
```sql
- id: UUID
- question_text: TEXT
- options: JSONB (array of 4 strings)
- correct_answer: INTEGER (0-3 for A-D)
- subject: TEXT ('math', 'english', 'science')
- difficulty: TEXT ('easy', 'medium', 'hard')
- target_age_min: INTEGER
- target_age_max: INTEGER
- tags: TEXT[] (e.g., ['multiplication', 'word-problems'])
- created_at: TIMESTAMPTZ
```

#### `quiz_attempts` Table
```sql
- id: UUID
- user_id: UUID
- subject: TEXT
- difficulty: TEXT
- quiz_type: TEXT ('assessment', 'practice')
- score_percentage: NUMERIC
- time_spent_seconds: INTEGER
- questions_answered: JSONB (array of question IDs)
- user_answers: JSONB (array of answer indices)
- completed_at: TIMESTAMPTZ
```

#### `user_performance_metrics` Table
```sql
- user_id: UUID
- subject: TEXT
- effective_age: INTEGER
- performance_adjustment: INTEGER (-2 to +2)
- edl_status: TEXT
- recent_accuracy: NUMERIC (0-100)
- quizzes_completed: INTEGER
- last_updated: TIMESTAMPTZ
```

### Anti-Repetition System

**Problem**: Students shouldn't see the same questions frequently

**Solution**: 30-day exclusion window
```sql
-- Exclude questions answered in last 30 days
WHERE question_id NOT IN (
  SELECT question_id FROM quiz_attempts
  WHERE user_id = $1
  AND completed_at > NOW() - INTERVAL '30 days'
)
```

### Research Foundation

The EDL adaptive algorithm is based on:

1. **Zone of Proximal Development** (Vygotsky, 1978)
   - Optimal challenge = slightly above current ability
   - Too easy = boredom, too hard = frustration
   - Flow zone (60-75% accuracy) maintains engagement

2. **Knowledge Tracing** (Corbett & Anderson, 1994)
   - Track mastery probability over time
   - Adjust difficulty based on performance history
   - Recent attempts weighted more heavily

3. **Optimal Challenge Theory** (Csikszentmihalyi, 1990)
   - Flow state requires balance of skill and challenge
   - Dynamic difficulty maintains flow
   - Prevents anxiety and boredom

4. **Spaced Repetition** (Ebbinghaus, 1885)
   - 30-day exclusion prevents over-practice
   - Reinforces long-term retention
   - Distributes learning over time

### Implementation Files

**EDL Core Logic:**
- `/lib/edl/types.ts` - Type definitions (133 lines)
- `/lib/edl/calculator.ts` - EDL calculations (197 lines)
- `/lib/edl/selector.ts` - Question selection (287 lines)

**Age Adaptations:**
- `/lib/age-adaptations.ts` - Age-specific UI and language

**API Routes:**
- `/app/api/questions/route.ts` - Question selection with EDL (278 lines)
- `/app/api/quiz-attempts/route.ts` - Quiz submission + EDL update (456 lines)
- `/app/api/edl/status/route.ts` - Fetch EDL metrics (89 lines)

**Frontend Components:**
- `/app/dashboard/practice/page.tsx` - Practice interface (572 lines)
- `/app/dashboard/assessment/page.tsx` - Assessment flow (391 lines)

## 🏗️ Architecture

### Supabase Client Configuration
The project uses three separate Supabase client configurations:
- **`lib/supabase/client.ts`** - Browser client for client components
- **`lib/supabase/server.ts`** - Server client with async cookie handling for server components
  ⚠️ **Important**: `cookies()` is async in Next.js 15 - always `await createClient()`
- **`lib/supabase/middleware.ts`** - Middleware client for authentication flows

### Authentication Flow
1. User registers with email, password, full_name, and birthdate
2. Age is calculated client-side from birthdate (min 13 years for COPPA compliance)
3. Email confirmation alert shown (no immediate redirect)
4. Email verification handled by `/api/auth/callback/route.ts`
5. Successful verification redirects to `/dashboard/learn?welcome=true`
6. Database trigger automatically creates user profile after email confirmation

### Client vs Server Components
- Auth pages use `'use client'` directive for React hooks
- Server components use async Supabase clients: `await createClient()`
- `useSearchParams` must be wrapped in `<Suspense>` boundaries
- RLS policies require proper INSERT permissions for profile creation

## 📁 Project Structure

```
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
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Hinura/Fullstack.git
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
# Development server uses Turbopack for faster builds
```

## 💻 Development Guide

### Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production with Turbopack
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier (if configured)
pnpm type-check   # TypeScript type checking (if configured)
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

# OpenAI AI (Required for AI features)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS_HINT=200
OPENAI_MAX_TOKENS_EXPLAIN=300
OPENAI_MAX_TOKENS_SUMMARY=350

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Environment Variable Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | - | Supabase anonymous key |
| `OPENAI_API_KEY` | ⚠️ For AI | - | OpenAI API key for hints/explanations |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |
| `OPENAI_MAX_TOKENS_HINT` | No | 200 | Max tokens for hint generation |
| `OPENAI_MAX_TOKENS_EXPLAIN` | No | 300 | Max tokens for explanations |
| `OPENAI_MAX_TOKENS_SUMMARY` | No | 350 | Max tokens for recommendations |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | App base URL |
| `NODE_ENV` | No | `development` | Environment mode |

## 🗄 Database Schema (Complete)

### Core Tables

#### User & Profile Tables

##### `profiles` (User Profile & Stats)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  birthdate DATE NOT NULL,
  age INTEGER NOT NULL,

  -- Overall Stats
  points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_achievements INTEGER DEFAULT 0,

  -- Subject-Specific Points & Levels
  math_points INTEGER DEFAULT 0,
  english_points INTEGER DEFAULT 0,
  science_points INTEGER DEFAULT 0,
  math_level INTEGER DEFAULT 1,
  english_level INTEGER DEFAULT 1,
  science_level INTEGER DEFAULT 1,

  -- Streak System
  streak_days INTEGER DEFAULT 0,
  highest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_available BOOLEAN DEFAULT true,
  streak_freeze_last_reset DATE DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Exercise & Question Tables

##### `questions` (Exercise Bank)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,  -- Array of 4 strings
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),

  -- Classification
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Age Targeting
  target_age_min INTEGER NOT NULL,
  target_age_max INTEGER NOT NULL,

  -- Metadata
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_subject_difficulty ON questions(subject, difficulty);
CREATE INDEX idx_questions_age_range ON questions(target_age_min, target_age_max);
```

##### `quiz_attempts` (Quiz History)
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Quiz Info
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('assessment', 'practice')),

  -- Performance
  score_percentage NUMERIC(5,2) NOT NULL,
  time_spent_seconds INTEGER,

  -- Question Data
  questions_answered JSONB NOT NULL,  -- Array of question IDs
  user_answers JSONB NOT NULL,        -- Array of answer indices

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_subject ON quiz_attempts(user_id, subject);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed_at DESC);
```

#### Adaptive Learning Tables

##### `user_performance_metrics` (EDL Tracking)
```sql
CREATE TABLE user_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),

  -- EDL Metrics
  effective_age INTEGER NOT NULL,
  performance_adjustment INTEGER DEFAULT 0 CHECK (performance_adjustment >= -2 AND performance_adjustment <= 2),
  edl_status TEXT NOT NULL CHECK (edl_status IN ('exceptional', 'approaching_mastery', 'flow_zone', 'challenging', 'struggling')),
  recent_accuracy NUMERIC(5,2) DEFAULT 0,

  -- Tracking
  quizzes_completed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, subject)
);

CREATE INDEX idx_metrics_user_subject ON user_performance_metrics(user_id, subject);
```

#### Gamification Tables

##### `achievements` (Badge Definitions)
```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,  -- e.g., 'first_steps', 'week_warrior'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('persistence', 'milestone', 'mastery', 'exploration')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon_name TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### `user_achievements` (Unlocked Badges)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);
```

##### `point_transactions` (XP Audit Log)
```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction Details
  points_change INTEGER NOT NULL,
  base_points INTEGER NOT NULL,
  multiplier NUMERIC(3,2) DEFAULT 1.0,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'quiz_correct', 'quiz_partial', 'quiz_completion',
    'streak_bonus', 'level_up', 'achievement_unlock', 'perfect_score'
  )),

  -- Context
  subject TEXT,
  metadata JSONB,  -- Stores difficulty, accuracy, etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created ON point_transactions(created_at DESC);
```

##### `level_history` (Level Progression)
```sql
CREATE TABLE level_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  old_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  points_at_levelup INTEGER NOT NULL,
  bonus_xp_awarded INTEGER DEFAULT 0,
  leveled_up_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_level_history_user ON level_history(user_id, subject);
```

##### `streak_milestones` (Streak Achievements)
```sql
CREATE TABLE streak_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL,
  bonus_xp INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, milestone_days)
);

CREATE INDEX idx_streak_milestones_user ON streak_milestones(user_id);
```

### Database Functions

#### `calculate_subject_level(points INTEGER)`
Calculates level from points using square root formula:
```sql
CREATE OR REPLACE FUNCTION calculate_subject_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(points / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### `get_streak_multiplier(streak_days INTEGER)`
Returns streak multiplier (1.0 - 1.5x):
```sql
CREATE OR REPLACE FUNCTION get_streak_multiplier(streak_days INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  CASE
    WHEN streak_days >= 60 THEN RETURN 1.5;
    WHEN streak_days >= 30 THEN RETURN 1.4;
    WHEN streak_days >= 14 THEN RETURN 1.3;
    WHEN streak_days >= 7 THEN RETURN 1.2;
    WHEN streak_days >= 3 THEN RETURN 1.1;
    ELSE RETURN 1.0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### `get_level_multiplier(level INTEGER)`
Returns level multiplier (1.0 - 1.3x):
```sql
CREATE OR REPLACE FUNCTION get_level_multiplier(level INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  CASE
    WHEN level >= 7 THEN RETURN 1.3;
    WHEN level >= 5 THEN RETURN 1.2;
    WHEN level >= 3 THEN RETURN 1.1;
    ELSE RETURN 1.0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### `update_user_streak_enhanced(user_id UUID)`
Updates daily streak with freeze protection:
```sql
-- Complex function handling:
-- - Daily activity tracking
-- - Streak freeze logic (1 per week, auto-apply)
-- - Milestone detection and rewards
-- - Personal best tracking
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies:

```sql
-- Users can only read/write their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Similar policies for:
-- - quiz_attempts
-- - user_performance_metrics
-- - user_achievements
-- - point_transactions
-- - level_history
-- - streak_milestones

-- Questions and achievements are public (read-only)
CREATE POLICY "Anyone can read questions" ON questions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT USING (true);
```

### Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- See full schema in /supabase/schema.sql
```

## 📡 API Documentation (Complete Reference)

### Authentication Endpoints

#### POST `/api/auth/register`
Registers a new user with email confirmation.

```typescript
// Request
{
  email: string
  password: string
  full_name: string
  birthdate: string  // Date string (YYYY-MM-DD)
  age: number        // Calculated from birthdate (min 13 for COPPA compliance)
}

// Response
{
  user: User
  // Note: Email confirmation required before session is created
  // User will be redirected to /dashboard/learn?welcome=true after email verification
}
```

**File**: `/app/(auth)/register/page.tsx`

#### GET `/api/auth/callback`
Handles email verification callback from Supabase Auth.

**Flow**:
1. User clicks verification link in email
2. Supabase redirects to this endpoint with code
3. Exchanges code for session
4. Creates user profile via database trigger
5. Redirects to `/dashboard/learn?welcome=true`

**File**: `/app/api/auth/callback/route.ts`

### Exercise & Quiz Endpoints

#### GET `/api/questions`
Fetches personalized question set using EDL algorithm.

```typescript
// Query Parameters
{
  subject: 'math' | 'english' | 'science'
  mode: 'adaptive' | 'easy' | 'medium' | 'hard'
  count: number  // Default: 10
}

// Response
{
  questions: Array<{
    id: string
    question_text: string
    options: string[]  // Array of 4 options
    subject: string
    difficulty: string
    target_age_min: number
    target_age_max: number
  }>
}
```

**EDL Logic**:
- Fetches user's performance metrics
- Calculates effective age
- Determines difficulty distribution
- Excludes questions from last 30 days
- Returns optimized question set

**File**: `/app/api/questions/route.ts` (278 lines)

#### POST `/api/quiz-attempts`
Submits completed quiz, updates EDL metrics, awards points.

```typescript
// Request
{
  subject: 'math' | 'english' | 'science'
  difficulty: string
  quiz_type: 'assessment' | 'practice'
  questions_answered: string[]  // Question IDs
  user_answers: number[]        // Answer indices (0-3)
  time_spent_seconds: number
}

// Response
{
  score_percentage: number
  correct_count: number
  total_questions: number
  points_earned: number
  base_points: number
  multiplier: number
  level_up: boolean
  new_level?: number
  edl_updated: boolean
}
```

**Processing**:
1. Validates answers against correct answers
2. Calculates score percentage
3. Awards points with multipliers
4. Updates subject-specific level
5. Recalculates EDL metrics
6. Updates streak (if applicable)
7. Checks for achievement unlocks

**File**: `/app/api/quiz-attempts/route.ts` (456 lines)

### Adaptive Learning (EDL) Endpoints

#### GET `/api/edl/status`
Fetches current EDL metrics for all subjects.

```typescript
// Response
{
  math: {
    effective_age: number
    performance_adjustment: number  // -2 to +2
    edl_status: 'exceptional' | 'approaching_mastery' | 'flow_zone' | 'challenging' | 'struggling'
    recent_accuracy: number
    quizzes_completed: number
  },
  english: { ... },
  science: { ... }
}
```

**File**: `/app/api/edl/status/route.ts` (89 lines)

### AI-Powered Endpoints

#### POST `/api/ai/hint`
Generates contextual hint for current question.

```typescript
// Request
{
  question: string
  options: string[]
  subject: 'math' | 'english' | 'science'
  difficulty: 'easy' | 'medium' | 'hard'
  age: number
}

// Response
{
  hint: string  // 1-2 sentence hint, never reveals answer
}
```

**Rate Limit**: 30 requests / 60 seconds per IP
**Caching**: 5-minute TTL
**Model**: gpt-4o-mini, temperature 0.2, max 200 tokens

**File**: `/app/api/ai/hint/route.ts`

#### POST `/api/ai/explain`
Generates personalized explanation after answering.

```typescript
// Request
{
  question: string
  correct_answer: string
  user_answer: string
  subject: string
  age: number
}

// Response
{
  explanation: string  // Max 120 words, includes self-check
}
```

**Rate Limit**: 20 requests / 60 seconds per IP
**Caching**: None (personalized)
**Model**: gpt-4o-mini, temperature 0.2, max 300 tokens

**File**: `/app/api/ai/explain/route.ts`

#### POST `/api/ai/recommendations`
Generates personalized study recommendations.

```typescript
// Request
{
  origin: 'learn' | 'assessment'  // Context for recommendation tone
}

// Response
{
  recommendations: Array<{
    subject: string
    difficulty: string
    reason: string
  }>
}
```

**Rate Limit**: 10 requests / 60 seconds per IP
**Authentication**: Required (uses session)
**Model**: gpt-4o-mini, temperature 0.2-0.3, max 350 tokens

**Data Used**:
- User age and skill levels
- Last 12 quiz attempts
- Subject performance trends

**File**: `/app/api/ai/recommendations/route.ts`

#### POST `/api/ai/insights`
Generates growth mindset-focused learning insights.

```typescript
// Request
{
  // Automatically fetches user data
}

// Response
{
  summary: string  // 80-120 words
  goals: string[]  // Array of 2 specific, actionable goals
}
```

**Rate Limit**: 8 requests / 60 seconds per IP
**Authentication**: Required
**Model**: gpt-4o-mini, temperature 0.2, max 350 tokens

**Philosophy**: No intelligence praise, focus on effort and strategy

**File**: `/app/api/ai/insights/route.ts`

### Gamification Endpoints

#### POST `/api/gamification/award-points`
Awards points with multipliers after quiz completion.

```typescript
// Request
{
  user_id: string
  subject: string
  base_points: number
  transaction_type: 'quiz_correct' | 'quiz_completion' | 'perfect_score' | ...
  metadata?: {
    difficulty?: string
    accuracy?: number
  }
}

// Response
{
  points_awarded: number
  base_points: number
  streak_multiplier: number
  level_multiplier: number
  total_multiplier: number
  new_total_points: number
}
```

**Calculation**:
```
total_multiplier = streak_multiplier × level_multiplier
points_awarded = base_points × total_multiplier
```

**File**: `/app/api/gamification/award-points/route.ts`

#### POST `/api/gamification/check-achievements`
Checks if user unlocked new achievements.

```typescript
// Request
{
  user_id: string
}

// Response
{
  newly_unlocked: Array<{
    id: string
    name: string
    description: string
    xp_reward: number
    category: string
    rarity: string
  }>
}
```

**Triggers**:
- After quiz completion
- After level up
- After streak milestone

**File**: `/app/api/gamification/check-achievements/route.ts`

#### POST `/api/gamification/update-streak`
Updates daily activity streak.

```typescript
// Request
{
  user_id: string
}

// Response
{
  streak_days: number
  highest_streak: number
  streak_continued: boolean
  streak_reset: boolean
  freeze_used: boolean
  milestone_reached?: {
    days: number
    bonus_xp: number
  }
}
```

**Logic**:
- Checks last activity date
- Applies freeze if missed exactly 1 day
- Resets streak if missed >1 day (and no freeze)
- Awards milestone bonuses at 3, 7, 14, 30, 60, 100 days
- Resets freeze availability on Mondays

**Database Function**: `update_user_streak_enhanced()`

**File**: `/app/api/gamification/update-streak/route.ts`

### API Endpoint Summary Table

| Category | Endpoint | Method | Auth Required | Rate Limit |
|----------|----------|--------|---------------|------------|
| **Auth** | `/api/auth/callback` | GET | No | - |
| **Questions** | `/api/questions` | GET | Yes | - |
| **Quizzes** | `/api/quiz-attempts` | POST | Yes | - |
| **EDL** | `/api/edl/status` | GET | Yes | - |
| **AI** | `/api/ai/hint` | POST | No | 30/60s |
| **AI** | `/api/ai/explain` | POST | No | 20/60s |
| **AI** | `/api/ai/recommendations` | POST | Yes | 10/60s |
| **AI** | `/api/ai/insights` | POST | Yes | 8/60s |
| **Gamification** | `/api/gamification/award-points` | POST | Yes | - |
| **Gamification** | `/api/gamification/check-achievements` | POST | Yes | - |
| **Gamification** | `/api/gamification/update-streak` | POST | Yes | - |

## 📚 Research Foundation (Comprehensive)

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


## 📅 Timeline

### Phase 1: Foundation (Weeks 1-3)
- [x] Project setup
- [x] Authentication system
- [x] Basic UI components
- [x] Database schema

### Phase 2: Core Features (Weeks 4-7)
- [x] Exercise system
- [x] Adaptive algorithm
- [x] Gamification elements
- [x] Progress tracking

### Phase 3: Polish (Weeks 8-10)
- [ ] Performance optimization
- [x] Testing
- [x] UI polish
- [x] Bug fixes

### Phase 4: Documentation (Weeks 11-12)
- [ ] Thesis writing
- [x] Code documentation
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
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Next.js 15 Specific Issues
- **Error**: `cookies() is not a function`
  **Solution**: Ensure you're using `await createClient()` in server components

- **Error**: `useSearchParams` causing issues
  **Solution**: Wrap components using `useSearchParams` in `<Suspense>` boundaries

#### Authentication Issues
- **Profile not created after registration**
  Check that database triggers are properly set up and RLS policies allow INSERT

- **Email confirmation not working**
  Verify `/api/auth/callback/route.ts` is properly configured

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'true')
```

## 📄 License

This project is part of an academic thesis and is not licensed for commercial use.

---

## 🆘 Support

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ⚙️ Key Implementation Notes

### Age Calculation
```typescript
// Calculates exact age from birthdate
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

### Password Visibility Toggle Pattern
```typescript
const [showPassword, setShowPassword] = useState(false)

// In JSX:
<Input type={showPassword ? "text" : "password"} />
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
</button>
```

### Important Considerations
- Always validate age ≥ 13 for COPPA compliance
- Store exact age (INTEGER) and birthdate (DATE), not age groups
- Email confirmation is mandatory for all registrations
- Profile creation happens automatically via database triggers
- Use appropriate Supabase client for component type (client/server/middleware)
