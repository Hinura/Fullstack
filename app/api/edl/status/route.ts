// app/api/edl/status/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { EDLStatusResponse } from '@/lib/edl/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject') // Optional: filter by subject

    // Get EDL status using PostgreSQL function
    const { data: edlStatus, error: edlError } = await supabase
      .rpc('get_edl_status', {
        p_user_id: user.id,
        p_subject: subject || null
      })

    if (edlError) {
      console.error('Error fetching EDL status:', edlError)
      return NextResponse.json(
        { error: 'Failed to fetch EDL status' },
        { status: 500 }
      )
    }

    // If no status found, user hasn't completed assessment
    if (!edlStatus || edlStatus.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Assessment not completed',
          redirect: '/dashboard/assessment?required=true'
        },
        { status: 404 }
      )
    }

    // Format response
    const subjects: Record<string, Omit<EDLStatusResponse, 'subject'>> = {}
    let totalAccuracy = 0
    let subjectsInFlowZone = 0
    let subjectsAdvanced = 0
    let subjectsNeedingSupport = 0

    edlStatus.forEach((item: EDLStatusResponse) => {
      subjects[item.subject] = {
        chronological_age: item.chronological_age,
        performance_adjustment: item.performance_adjustment,
        effective_age: item.effective_age,
        recent_accuracy: item.recent_accuracy ? Math.round(item.recent_accuracy * 10) / 10 : null,
        total_quizzes: item.total_quizzes,
        has_completed_assessment: item.has_completed_assessment,
        last_quiz_at: item.last_quiz_at,
        status: item.status,
        next_adjustment_in: item.next_adjustment_in
      }

      // Calculate overall stats
      if (item.recent_accuracy) {
        totalAccuracy += item.recent_accuracy
      }

      if (item.status === 'flow_zone') subjectsInFlowZone++
      if (item.performance_adjustment > 0) subjectsAdvanced++
      if (item.performance_adjustment < 0) subjectsNeedingSupport++
    })

    const averageAccuracy = edlStatus.length > 0
      ? Math.round((totalAccuracy / edlStatus.length) * 10) / 10
      : 0

    return NextResponse.json({
      success: true,
      data: {
        subjects,
        overall_status: {
          average_accuracy: averageAccuracy,
          subjects_in_flow_zone: subjectsInFlowZone,
          subjects_advanced: subjectsAdvanced,
          subjects_needing_support: subjectsNeedingSupport
        }
      }
    })

  } catch (error) {
    console.error('Error in EDL status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
