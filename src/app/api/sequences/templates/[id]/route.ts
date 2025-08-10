import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.enum(['welcome', 'reminder', 'thank_you', 'followup', 'promotional', 'notification', 'emergency', 'birthday', 'anniversary']).optional(),
  template_type: z.enum(['email', 'sms']).optional(),
  subject: z.string().max(255).optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  language: z.string().max(10).optional()
})

// PUT /api/sequences/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const templateId = params.id
    const body = await request.json()
    
    const validatedData = updateTemplateSchema.parse(body)

    // Extract variables from content if content is being updated
    if (validatedData.content && !validatedData.variables) {
      const variableMatches = validatedData.content.match(/\{\{(\w+)\}\}/g)
      validatedData.variables = variableMatches 
        ? [...new Set(variableMatches.map(match => match.slice(2, -2)))]
        : []
    }
    
    const template = await sequenceService.updateTemplate(
      tenantSchema,
      templateId,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error(`PUT /api/sequences/templates/${params.id} error:`, error)
    
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

    const status = error instanceof Error && error.message === 'Template not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update template' 
      },
      { status }
    )
  }
}

// DELETE /api/sequences/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const templateId = params.id

    await sequenceService.deleteTemplate(tenantSchema, templateId)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/sequences/templates/${params.id} error:`, error)
    
    const status = error instanceof Error && error.message === 'Template not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete template' 
      },
      { status }
    )
  }
}