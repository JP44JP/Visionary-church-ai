import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

// Twilio webhook payload schema
const twilioWebhookSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.enum(['queued', 'sent', 'delivered', 'failed', 'undelivered']),
  To: z.string(),
  From: z.string(),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
  Timestamp: z.string().optional()
})

// MessageBird webhook payload schema
const messageBirdWebhookSchema = z.object({
  id: z.string(),
  status: z.enum(['sent', 'delivered', 'failed']),
  recipient: z.string(),
  statusDatetime: z.string(),
  statusErrorCode: z.number().optional(),
  statusReason: z.string().optional()
})

const supabase = createServerSupabaseClient()

// POST /api/webhooks/sms-delivery - Handle SMS delivery status webhooks
export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get('x-sms-provider') || 'unknown'
    const signature = request.headers.get('x-twilio-signature') || request.headers.get('x-signature')
    
    // Basic authentication check
    if (!signature && !request.headers.get('x-api-key')) {
      return NextResponse.json(
        { error: 'Webhook authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    let events: any[] = []

    // Parse based on provider
    switch (provider.toLowerCase()) {
      case 'twilio':
        events = [twilioWebhookSchema.parse(body)]
        break
      case 'messagebird':
        events = [messageBirdWebhookSchema.parse(body)]
        break
      default:
        // Generic webhook format
        events = Array.isArray(body) ? body : [body]
    }

    let processedCount = 0
    let errorCount = 0

    for (const event of events) {
      try {
        await processSMSEvent(event, provider)
        processedCount++
      } catch (error) {
        console.error('Error processing SMS event:', error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      message: `Processed ${processedCount} SMS events`
    })

  } catch (error) {
    console.error('SMS delivery webhook error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid webhook payload', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function processSMSEvent(event: any, provider: string): Promise<void> {
  let phone: string
  let eventType: string
  let timestamp: Date
  let messageId: string
  let errorCode: string | undefined
  let errorMessage: string | undefined

  // Normalize event data based on provider
  switch (provider.toLowerCase()) {
    case 'twilio':
      phone = event.To
      eventType = event.MessageStatus
      timestamp = event.Timestamp ? new Date(event.Timestamp) : new Date()
      messageId = event.MessageSid
      errorCode = event.ErrorCode
      errorMessage = event.ErrorMessage
      break
    case 'messagebird':
      phone = event.recipient
      eventType = event.status
      timestamp = new Date(event.statusDatetime)
      messageId = event.id
      errorCode = event.statusErrorCode?.toString()
      errorMessage = event.statusReason
      break
    default:
      // Generic format
      phone = event.phone || event.to || event.recipient
      eventType = event.status || event.event
      timestamp = new Date(event.timestamp || Date.now())
      messageId = event.message_id || event.id
      errorCode = event.error_code
      errorMessage = event.error_message || event.reason
  }

  // Find the message in our database
  const { data: messages, error } = await supabase
    .from('sequence_messages') // This would need to be tenant-specific
    .select('id, enrollment_id, tenant_schema')
    .eq('external_id', messageId)
    .or(`recipient_phone.eq.${phone}`)

  if (error) {
    console.error('Error finding SMS message:', error)
    return
  }

  for (const message of messages || []) {
    const tenantSchema = message.tenant_schema || 'tenant_default'
    
    // Update message status based on event
    const updateData: any = {
      delivery_metadata: {
        provider,
        event_type: eventType,
        timestamp: timestamp.toISOString(),
        error_code: errorCode,
        error_message: errorMessage
      }
    }

    switch (eventType.toLowerCase()) {
      case 'sent':
      case 'queued':
        updateData.status = 'sent'
        updateData.sent_at = timestamp.toISOString()
        break
      case 'delivered':
        updateData.status = 'delivered'
        updateData.delivered_at = timestamp.toISOString()
        break
      case 'failed':
      case 'undelivered':
        updateData.status = 'failed'
        updateData.failed_at = timestamp.toISOString()
        updateData.error_message = errorMessage || `Error code: ${errorCode}`
        break
    }

    // Update the message record
    await supabase
      .from(`${tenantSchema}.sequence_messages`)
      .update(updateData)
      .eq('id', message.id)

    // Handle specific error cases
    if (eventType.toLowerCase() === 'failed' && errorCode) {
      await handleSMSError(tenantSchema, phone, errorCode, message.enrollment_id)
    }
  }
}

async function handleSMSError(
  tenantSchema: string, 
  phone: string, 
  errorCode: string, 
  enrollmentId: string
): Promise<void> {
  try {
    // Common SMS error codes that indicate the number should be removed
    const permanentErrorCodes = [
      '21211', // Invalid phone number (Twilio)
      '21614', // Number cannot receive SMS (Twilio)
      '30007', // Message filtered (Twilio)
      '21610'  // Message blocked (Twilio)
    ]

    if (permanentErrorCodes.includes(errorCode)) {
      // Disable SMS for this number
      await supabase
        .from(`${tenantSchema}.communication_preferences`)
        .upsert({
          visitor_phone: phone,
          sms_enabled: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'visitor_phone'
        })

      // Cancel SMS enrollments for this number
      await supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: `SMS delivery error: ${errorCode}`
        })
        .eq('id', enrollmentId)

      console.log(`Disabled SMS for ${phone} due to error code: ${errorCode}`)
    }
  } catch (error) {
    console.error('Error handling SMS error:', error)
  }
}

// Handle incoming SMS messages (opt-out, replies, etc.)
export async function PUT(request: NextRequest) {
  try {
    const provider = request.headers.get('x-sms-provider') || 'twilio'
    const body = await request.json()

    let fromPhone: string
    let messageBody: string

    switch (provider.toLowerCase()) {
      case 'twilio':
        fromPhone = body.From
        messageBody = body.Body?.toLowerCase() || ''
        break
      default:
        fromPhone = body.from || body.phone
        messageBody = body.message?.toLowerCase() || body.body?.toLowerCase() || ''
    }

    // Check for opt-out keywords
    const optOutKeywords = ['stop', 'unsubscribe', 'quit', 'end', 'cancel']
    const isOptOut = optOutKeywords.some(keyword => messageBody.includes(keyword))

    if (isOptOut) {
      // Find tenant schema for this phone number
      const { data: preferences } = await supabase
        .from('communication_preferences') // Would need to search across tenant schemas
        .select('tenant_schema')
        .eq('visitor_phone', fromPhone)
        .limit(1)
        .single()

      const tenantSchema = preferences?.tenant_schema || 'tenant_default'

      await handleSMSOptOut(tenantSchema, fromPhone)

      // Send confirmation message
      return NextResponse.json({
        success: true,
        reply: "You have been unsubscribed from SMS messages. Reply START to resubscribe.",
        message: "Opt-out processed"
      })
    }

    // Handle other message types (replies, etc.)
    return NextResponse.json({
      success: true,
      message: "Message received"
    })

  } catch (error) {
    console.error('Error handling incoming SMS:', error)
    return NextResponse.json(
      { error: 'Failed to process incoming SMS' },
      { status: 500 }
    )
  }
}

async function handleSMSOptOut(tenantSchema: string, phone: string): Promise<void> {
  try {
    // Update communication preferences
    await supabase
      .from(`${tenantSchema}.communication_preferences`)
      .upsert({
        visitor_phone: phone,
        sms_enabled: false,
        global_unsubscribe: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'visitor_phone'
      })

    // Cancel active SMS enrollments
    await supabase
      .from(`${tenantSchema}.sequence_enrollments`)
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: 'SMS opt-out'
      })
      .in('id', 
        supabase
          .from(`${tenantSchema}.sequence_messages`)
          .select('enrollment_id')
          .eq('recipient_phone', phone)
          .eq('message_type', 'sms')
      )

    console.log(`Processed SMS opt-out for ${phone}`)
  } catch (error) {
    console.error('Error handling SMS opt-out:', error)
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const challenge = url.searchParams.get('challenge')
  
  return NextResponse.json({ 
    success: true, 
    challenge,
    message: 'SMS webhook endpoint active'
  })
}