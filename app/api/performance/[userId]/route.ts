/**
 * Performance Metrics API
 * Get user performance metrics and EDL statistics
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  getUserOverallStatistics,
  getOrInitializePerformanceMetrics,
  isValidSubject,
} from '@/lib/edl';
import type { Subject } from '@/lib/types/edl';

// GET - Fetch user performance metrics
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to fetch their own metrics (or extend for admin later)
    if (user.id !== userId) {
      return NextResponse.json({
        error: 'Forbidden: Cannot access other users\' metrics'
      }, { status: 403 });
    }

    // Get user profile for chronological age
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'User profile not found'
      }, { status: 404 });
    }

    // If subject is specified, return metrics for that subject only
    if (subject) {
      if (!isValidSubject(subject)) {
        return NextResponse.json({
          error: 'Invalid subject. Must be one of: math, english, science'
        }, { status: 400 });
      }

      const metrics = await getOrInitializePerformanceMetrics(
        userId,
        subject as Subject,
        profile.age
      );

      return NextResponse.json({
        subject,
        metrics,
        chronological_age: profile.age,
      });
    }

    // Otherwise, return overall statistics across all subjects
    const overallStats = await getUserOverallStatistics(userId);

    return NextResponse.json({
      user_id: userId,
      chronological_age: profile.age,
      overall_statistics: overallStats,
    });
  } catch (error) {
    console.error('Error in performance GET:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
