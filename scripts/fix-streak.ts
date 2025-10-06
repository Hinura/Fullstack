// Script to manually fix user streak based on quiz attempt history
// Run with: npx tsx scripts/fix-streak.ts

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need to add this to .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixStreak() {
  try {
    // Get all users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return
    }

    for (const profile of profiles || []) {
      console.log(`\nProcessing user: ${profile.full_name} (${profile.id})`)

      // Get all quiz attempts for this user, ordered by date
      const { data: attempts, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('completed_at')
        .eq('user_id', profile.id)
        .order('completed_at', { ascending: true })

      if (attemptError) {
        console.error('Error fetching attempts:', attemptError)
        continue
      }

      if (!attempts || attempts.length === 0) {
        console.log('No quiz attempts found')
        continue
      }

      // Get unique dates (in case multiple quizzes on same day)
      const uniqueDates = [...new Set(
        attempts.map(a => new Date(a.completed_at).toDateString())
      )].map(d => new Date(d))

      console.log('Quiz dates:', uniqueDates.map(d => d.toLocaleDateString()))

      // Calculate current streak
      let currentStreak = 1
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Start from the most recent date
      let lastDate = uniqueDates[uniqueDates.length - 1]
      lastDate.setHours(0, 0, 0, 0)

      // Check if the most recent activity is today or yesterday
      const daysSinceLastActivity = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastActivity > 1) {
        // Streak is broken
        currentStreak = 0
        console.log('Streak broken - last activity more than 1 day ago')
      } else {
        // Count backwards from the most recent date to find consecutive days
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const currentDate = new Date(uniqueDates[i])
          currentDate.setHours(0, 0, 0, 0)

          const previousDate = new Date(uniqueDates[i + 1])
          previousDate.setHours(0, 0, 0, 0)

          const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysDiff === 1) {
            // Consecutive day found
            currentStreak++
          } else {
            // Gap found, stop counting
            break
          }
        }

        console.log(`Calculated streak: ${currentStreak} days`)
      }

      // Update the profile with correct streak and last activity date
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          streak_days: currentStreak,
          last_activity_date: lastDate.toISOString().split('T')[0]
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Error updating streak:', updateError)
      } else {
        console.log(`✅ Updated streak to ${currentStreak} days`)
      }
    }

    console.log('\n✅ Streak fix complete!')
  } catch (error) {
    console.error('Error:', error)
  }
}

fixStreak()
