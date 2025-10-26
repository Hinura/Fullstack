# Database Migrations

This directory contains all database migrations for the Hinura learning platform.

## Migration Order

Run these migrations in the following order:

### 1. Core Tables & Functions (Required First)
```bash
database-migrations.sql
```
Creates:
- `profiles` table with user data
- `questions` table for practice/quiz questions
- `quiz_attempts` table for tracking quiz performance
- Gamification functions (`increment_user_points`, `update_user_streak`, `update_user_level`)

### 2. Assessment System (Required Before Using Assessments)
```bash
20251026_create_assessment_system.sql
```
Creates:
- `assessment_questions` table (questions for initial skill assessment)
- `user_assessments` table (assessment session tracking)
- `user_assessment_answers` table (individual question answers)
- `user_skill_levels` table (calculated skill levels 1-5)
- RLS policies for all assessment tables

### 3. EDL Adaptive Learning System (Required for Adaptive Difficulty)
```bash
20251022_add_edl_system.sql
```
Creates:
- `user_performance_metrics` table with generated `effective_age` column
- `user_question_history` table for tracking question attempts
- EDL calculation functions
- Composite indexes for performance

### 4. Subject Type Standardization (Recommended)
```bash
20251026_standardize_subject_type.sql
```
- Drops any existing `subject_type` enum
- Standardizes all tables to use `TEXT CHECK` pattern
- Creates helper functions for validation and mapping
- Updates EDL initialization function

### 5. Bug Fixes & Enhancements (Apply As Needed)

#### Subject Type Enum (DEPRECATED - Use 20251026_standardize_subject_type.sql instead)
```bash
# DO NOT USE - These migrations are superseded by standardization migration
# fix_subject_type_enum.sql
# fix_subject_type_enum_values.sql
```

#### RLS Policy Fixes
```bash
fix_user_question_history_rls.sql  # Adds missing UPDATE policy for upsert operations
```

#### EDL Initialization Fix
```bash
fix_edl_initialization.sql  # Resets performance adjustments to 0 for new users
```

#### Streak Calculation Fix
```bash
fix_streak.sql  # Refactors streak calculation function
```

## Quick Start (Fresh Database)

Run these in order:
```bash
psql -f migrations/database-migrations.sql
psql -f migrations/20251026_create_assessment_system.sql
psql -f migrations/20251022_add_edl_system.sql
psql -f migrations/20251026_standardize_subject_type.sql
psql -f migrations/fix_user_question_history_rls.sql
psql -f migrations/fix_edl_initialization.sql
```

## Using Supabase CLI

If you're using the Supabase CLI, you can apply migrations with:

```bash
supabase db reset  # Resets database and runs all migrations
```

Or manually:
```bash
supabase db push
```

## Table Dependencies

```
auth.users (Supabase Auth)
  ├── profiles
  ├── user_assessments
  │   └── user_assessment_answers
  │       └── assessment_questions
  ├── user_skill_levels
  ├── quiz_attempts
  ├── user_performance_metrics
  └── user_question_history
      └── questions
```

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **profiles** | self | trigger | self | - |
| **questions** | authenticated | service_role | service_role | service_role |
| **quiz_attempts** | self | self | - | - |
| **assessment_questions** | authenticated | service_role | service_role | service_role |
| **user_assessments** | self | self | self | self |
| **user_assessment_answers** | self (via assessment) | self (via assessment) | - | self (via assessment) |
| **user_skill_levels** | self | self | self | - |
| **user_performance_metrics** | self | self | self | - |
| **user_question_history** | self | self | self | - |

## Notes

- All tables have RLS enabled
- `service_role` is used for admin/backend operations that bypass RLS
- Profile creation is handled by database triggers
- EDL metrics are initialized on first quiz attempt
- Assessment questions are separate from practice questions

## Troubleshooting

**Issue: RLS policy errors when inserting**
- Ensure the user is authenticated (`auth.uid()` returns valid UUID)
- Check that RLS policies match the operation (INSERT/UPDATE/SELECT)

**Issue: Cannot update `effective_age` directly**
- `effective_age` is a GENERATED column, it updates automatically when `chronological_age` or `performance_adjustment` changes

**Issue: Duplicate key errors in `user_question_history`**
- Table uses composite primary key `(user_id, question_id)`
- Use `ON CONFLICT (user_id, question_id) DO UPDATE` for upserts
- Requires UPDATE RLS policy (fixed in `fix_user_question_history_rls.sql`)

**Issue: Subject type errors**
- Some tables use TEXT with CHECK constraint
- Some migration attempts use enum type
- Currently standardized on TEXT CHECK for consistency
