import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prayerService } from '../../../../services/prayerService'
import { PrayerCategory, PrayerUrgency, PrayerPrivacyLevel } from '../../../../types'

const submitPrayerRequestSchema = z.object({
  church_id: z.string().uuid(),
  requester_name: z.string().max(100).optional(),
  requester_email: z.string().email().optional(),
  requester_phone: z.string().max(20).optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum([
    'healing', 'guidance', 'thanksgiving', 'family', 'financial', 
    'relationships', 'grief', 'addiction', 'mental_health', 
    'spiritual_growth', 'salvation', 'protection', 'employment', 
    'travel', 'other'
  ] as const),
  urgency: z.enum(['routine', 'urgent', 'emergency'] as const),
  privacy_level: z.enum(['public', 'prayer_team_only', 'leadership_only', 'private'] as const),
  is_anonymous: z.boolean(),
  allow_updates: z.boolean(),
  consent_to_contact: z.boolean(),
  consent_to_store: z.boolean()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = submitPrayerRequestSchema.parse(body)
    
    // Check required consents
    if (!validatedData.consent_to_store) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Consent to store data is required' 
        },
        { status: 400 }
      )
    }

    // If not anonymous, require contact info
    if (!validatedData.is_anonymous && !validatedData.requester_email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required for non-anonymous requests' 
        },
        { status: 400 }
      )
    }

    // Extract metadata from request
    const metadata = {
      source: 'web_form',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer')
    }

    // Submit prayer request
    const result = await prayerService.submitPrayerRequest(
      validatedData.church_id,
      validatedData,
      metadata
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Error in prayer submission endpoint:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}