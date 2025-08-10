import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['welcome', 'reminder', 'thank_you', 'followup', 'promotional', 'notification', 'emergency', 'birthday', 'anniversary']),
  template_type: z.enum(['email', 'sms']),
  subject: z.string().max(255).optional(),
  content: z.string().min(1),
  variables: z.array(z.string()).optional(),
  language: z.string().max(10).optional()
})

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.enum(['welcome', 'reminder', 'thank_you', 'followup', 'promotional', 'notification', 'emergency', 'birthday', 'anniversary']).optional(),
  template_type: z.enum(['email', 'sms']).optional(),
  subject: z.string().max(255).optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  language: z.string().max(10).optional()
})

// GET /api/sequences/templates - Get all templates for tenant
export async function GET(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const url = new URL(request.url)
    
    const category = url.searchParams.get('category') || undefined
    const type = url.searchParams.get('type') as 'email' | 'sms' | undefined

    const templates = await sequenceService.getTemplates(tenantSchema, category, type)

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length
    })
  } catch (error) {
    console.error('GET /api/sequences/templates error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get templates' 
      },
      { status: 500 }
    )
  }
}

// POST /api/sequences/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createTemplateSchema.parse(body)
    
    // Validate that email templates have subjects
    if (validatedData.template_type === 'email' && !validatedData.subject) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email templates must have a subject' 
        },
        { status: 400 }
      )
    }

    // Extract variables from content if not provided
    if (!validatedData.variables) {
      const variableMatches = validatedData.content.match(/\{\{(\w+)\}\}/g)
      validatedData.variables = variableMatches 
        ? [...new Set(variableMatches.map(match => match.slice(2, -2)))]
        : []
    }
    
    const template = await sequenceService.createTemplate(
      tenantSchema,
      user.id,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: template
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sequences/templates error:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to create template' 
      },
      { status: 500 }
    )
  }
}