import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'
import { authenticateApiKey } from '@/lib/auth'

// SendGrid webhook payload schema
const sendgridWebhookSchema = z.array(z.object({
  email: z.string().email(),
  timestamp: z.number(),
  event: z.enum(['delivered', 'bounce', 'dropped', 'open', 'click', 'unsubscribe', 'spamreport']),
  reason: z.string().optional(),
  sg_event_id: z.string(),
  sg_message_id: z.string(),
  url: z.string().optional(), // For click events
  useragent: z.string().optional(),
  ip: z.string().optional()
}))

// Mailgun webhook payload schema  
const mailgunWebhookSchema = z.object({
  'event-data': z.object({
    event: z.enum(['delivered', 'failed', 'opened', 'clicked', 'unsubscribed', 'complained']),
    timestamp: z.number(),
    id: z.string(),
    message: z.object({
      headers: z.object({
        'message-id': z.string()
      })
    }),
    recipient: z.string().email(),
    reason: z.string().optional(),
    url: z.string().optional()
  })
})

const supabase = createServerSupabaseClient()

// POST /api/webhooks/email-delivery - Handle email delivery status webhooks
export async function POST(request: NextRequest) {
  try {
    // Authenticate webhook (could be API key, signature verification, etc.)
    const provider = request.headers.get('x-email-provider') || 'unknown'
    const signature = request.headers.get('x-signature')
    
    // Basic API key authentication for now
    // In production, you'd verify webhook signatures
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
      case 'sendgrid':
        events = sendgridWebhookSchema.parse(body)
        break
      case 'mailgun':
        const mailgunData = mailgunWebhookSchema.parse(body)
        events = [mailgunData['event-data']]
        break
      default:
        // Generic webhook format
        events = Array.isArray(body) ? body : [body]
    }

    let processedCount = 0
    let errorCount = 0

    for (const event of events) {
      try {
        await processEmailEvent(event, provider)
        processedCount++
      } catch (error) {
        console.error('Error processing email event:', error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      message: `Processed ${processedCount} email events`
    })

  } catch (error) {
    console.error('Email delivery webhook error:', error)
    
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

async function processEmailEvent(event: any, provider: string): Promise<void> {
  let email: string
  let eventType: string
  let timestamp: Date
  let messageId: string
  let reason: string | undefined
  let url: string | undefined

  // Normalize event data based on provider
  switch (provider.toLowerCase()) {
    case 'sendgrid':
      email = event.email
      eventType = event.event
      timestamp = new Date(event.timestamp * 1000)
      messageId = event.sg_message_id
      reason = event.reason
      url = event.url
      break
    case 'mailgun':
      email = event.recipient
      eventType = event.event
      timestamp = new Date(event.timestamp * 1000)
      messageId = event.message.headers['message-id']
      reason = event.reason
      url = event.url
      break
    default:
      // Generic format
      email = event.email || event.recipient
      eventType = event.event || event.type
      timestamp = new Date(event.timestamp ? event.timestamp * 1000 : Date.now())
      messageId = event.message_id || event.id
      reason = event.reason
      url = event.url
  }

  // Find the message in our database
  const { data: messages, error } = await supabase
    .from('sequence_messages') // This would need to be tenant-specific
    .select('id, enrollment_id, tenant_schema')
    .eq('external_id', messageId)
    .or(`recipient_email.eq.${email}`)

  if (error) {
    console.error('Error finding message:', error)
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
        reason,
        url
      }
    }

    switch (eventType.toLowerCase()) {
      case 'delivered':
        updateData.status = 'delivered'
        updateData.delivered_at = timestamp.toISOString()
        break
      case 'bounce':
      case 'dropped':
      case 'failed':
        updateData.status = 'bounced'
        updateData.bounced_at = timestamp.toISOString()
        updateData.error_message = reason
        break
      case 'open':
      case 'opened':
        updateData.opened_at = timestamp.toISOString()
        // Don't change status, just record the open
        delete updateData.status
        break
      case 'click':
      case 'clicked':
        updateData.clicked_at = timestamp.toISOString()
        updateData.tracking_data = { clicked_url: url }
        // Don't change status, just record the click
        delete updateData.status
        break
      case 'unsubscribe':
      case 'unsubscribed':
        // Handle unsubscribe
        await handleUnsubscribe(tenantSchema, email, message.enrollment_id)
        break
      case 'spamreport':
      case 'complained':
        // Handle spam complaint
        await handleSpamComplaint(tenantSchema, email, message.enrollment_id)
        break
    }

    // Update the message record
    if (Object.keys(updateData).length > 1) { // More than just delivery_metadata
      await supabase
        .from(`${tenantSchema}.sequence_messages`)
        .update(updateData)
        .eq('id', message.id)
    }
  }
}

async function handleUnsubscribe(tenantSchema: string, email: string, enrollmentId: string): Promise<void> {
  try {
    // Mark user as unsubscribed
    await supabase
      .from(`${tenantSchema}.communication_preferences`)
      .upsert({
        visitor_email: email,
        email_enabled: false,
        global_unsubscribe: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'visitor_email'
      })

    // Cancel active enrollments for this email
    await supabase
      .from(`${tenantSchema}.sequence_enrollments`)
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: 'Email unsubscribe'
      })
      .eq('id', enrollmentId)

    console.log(`Processed unsubscribe for ${email}`)
  } catch (error) {
    console.error('Error handling unsubscribe:', error)
  }
}

async function handleSpamComplaint(tenantSchema: string, email: string, enrollmentId: string): Promise<void> {
  try {
    // Mark user as complained and unsubscribe
    await supabase
      .from(`${tenantSchema}.communication_preferences`)
      .upsert({
        visitor_email: email,
        email_enabled: false,
        global_unsubscribe: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'visitor_email'
      })

    // Cancel active enrollments
    await supabase
      .from(`${tenantSchema}.sequence_enrollments`)
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: 'Spam complaint'
      })
      .eq('id', enrollmentId)

    // Log the complaint for review
    console.warn(`Spam complaint received from ${email}`)
  } catch (error) {
    console.error('Error handling spam complaint:', error)
  }
}

// GET endpoint for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const challenge = url.searchParams.get('challenge')
  const verify_token = url.searchParams.get('verify_token')

  // Simple verification for development
  if (verify_token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({ error: 'Invalid verify token' }, { status: 401 })
}