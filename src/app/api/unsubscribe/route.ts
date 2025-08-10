import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'

const sequenceService = new SequenceService()

const unsubscribeSchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  sequence_id: z.string().uuid().optional(),
  global: z.boolean().optional()
}).refine(
  data => data.token || data.email || data.phone,
  {
    message: "Either token, email, or phone is required",
    path: ["token"]
  }
)

// POST /api/unsubscribe - Handle unsubscribe requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = unsubscribeSchema.parse(body)

    let email: string | undefined
    let phone: string | undefined
    let sequenceId: string | undefined

    // Decode token if provided
    if (validatedData.token) {
      try {
        const decoded = JSON.parse(Buffer.from(validatedData.token, 'base64').toString())
        email = decoded.email
        phone = decoded.phone
        sequenceId = decoded.sequenceId
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid unsubscribe token' 
          },
          { status: 400 }
        )
      }
    } else {
      email = validatedData.email
      phone = validatedData.phone
      sequenceId = validatedData.sequence_id
    }

    // Determine tenant schema from request (this would need to be implemented)
    // For now, we'll need to get this from the domain or a header
    const tenantSchema = request.headers.get('x-tenant-schema') || 'tenant_default'

    await sequenceService.unsubscribe(
      tenantSchema,
      email,
      phone,
      validatedData.global ? undefined : sequenceId
    )

    return NextResponse.json({
      success: true,
      message: validatedData.global 
        ? 'Successfully unsubscribed from all communications'
        : sequenceId 
          ? 'Successfully unsubscribed from sequence'
          : 'Successfully unsubscribed'
    })
  } catch (error) {
    console.error('POST /api/unsubscribe error:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to process unsubscribe' 
      },
      { status: 500 }
    )
  }
}

// GET /api/unsubscribe - Show unsubscribe page (for one-click unsubscribe)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unsubscribe token is required' 
        },
        { status: 400 }
      )
    }

    // Decode token to get details
    let email: string | undefined
    let phone: string | undefined
    let sequenceId: string | undefined

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      email = decoded.email
      phone = decoded.phone
      sequenceId = decoded.sequenceId
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unsubscribe token' 
        },
        { status: 400 }
      )
    }

    // Return unsubscribe page data
    return NextResponse.json({
      success: true,
      data: {
        email,
        phone,
        sequence_id: sequenceId,
        token
      }
    })
  } catch (error) {
    console.error('GET /api/unsubscribe error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load unsubscribe page' 
      },
      { status: 500 }
    )
  }
}