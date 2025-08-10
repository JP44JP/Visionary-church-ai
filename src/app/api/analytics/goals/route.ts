import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../services/analyticsService';
import { z } from 'zod';

const analyticsService = new AnalyticsService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const goalSchema = z.object({
  goal_name: z.string().min(1).max(100),
  goal_type: z.enum(['event', 'page_view', 'duration', 'value']),
  goal_value: z.number().optional(),
  conditions: z.record(z.any()),
  is_active: z.boolean().default(true)
});

const goalCompletionSchema = z.object({
  goal_id: z.string(),
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  visitor_id: z.string().optional(),
  goal_value: z.number().optional(),
  conversion_path: z.array(z.any()).default([]),
  first_touch_source: z.string().optional(),
  first_touch_medium: z.string().optional(),
  last_touch_source: z.string().optional(),
  last_touch_medium: z.string().optional()
});

// GET /api/analytics/goals - Get goals and completions
export async function GET(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goal_id');
    const period = searchParams.get('period') as any;

    const completions = await analyticsService.getGoalCompletions(
      churchId,
      goalId || undefined,
      period || undefined
    );

    return NextResponse.json({
      success: true,
      data: completions
    });
  } catch (error) {
    console.error('Error fetching goal completions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal completions' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/goals - Create goal or track completion
export async function POST(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');
    
    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Check if it's goal creation or completion tracking
    if (body.goal_name) {
      // Goal creation
      if (!userId) {
        return NextResponse.json({ error: 'User ID required for goal creation' }, { status: 400 });
      }

      const validatedGoal = goalSchema.parse(body);
      
      const goalId = await analyticsService.createGoal({
        church_id: churchId,
        created_by: userId,
        ...validatedGoal
      });

      return NextResponse.json({
        success: true,
        data: { goal_id: goalId },
        message: 'Goal created successfully'
      });
    } else {
      // Goal completion tracking
      const validatedCompletion = goalCompletionSchema.parse(body);
      
      await analyticsService.trackGoalCompletion({
        church_id: churchId,
        ...validatedCompletion
      });

      return NextResponse.json({
        success: true,
        message: 'Goal completion tracked successfully'
      });
    }
  } catch (error) {
    console.error('Error handling goal request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process goal request' },
      { status: 500 }
    );
  }
}