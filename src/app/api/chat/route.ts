import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  churchSlug: z.string().min(1),
  sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, churchSlug, sessionId } = chatRequestSchema.parse(body)

    const supabase = createServerSupabaseClient()

    // Get church information
    const { data: church, error: churchError } = await supabase
      .from('churches')
      .select('*')
      .eq('slug', churchSlug)
      .single()

    if (churchError || !church) {
      return NextResponse.json(
        { error: 'Church not found' },
        { status: 404 }
      )
    }

    // For now, return a simple response
    // TODO: Implement OpenAI integration
    const response = generateSimpleResponse(message, church)

    // TODO: Save message to database
    // const { data: chatSession } = await supabase
    //   .from('chat_sessions')
    //   .upsert({
    //     id: sessionId || crypto.randomUUID(),
    //     church_id: church.id,
    //     messages: [
    //       { role: 'user', content: message, timestamp: new Date().toISOString() },
    //       { role: 'assistant', content: response, timestamp: new Date().toISOString() }
    //     ]
    //   })

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        sessionId: sessionId || crypto.randomUUID(),
      }
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSimpleResponse(message: string, church: any): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('visit') || lowerMessage.includes('come') || lowerMessage.includes('attend')) {
    return `We'd love to have you visit ${church.name}! Our main service is on Sundays. Would you like me to help you schedule a visit or get more information about what to expect?`
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('when') || lowerMessage.includes('schedule')) {
    return `Our main worship service is on Sundays at 10:00 AM. We also have a mid-week service on Wednesdays at 7:00 PM. Would you like to know more about any specific service?`
  }
  
  if (lowerMessage.includes('pastor') || lowerMessage.includes('leader')) {
    return `Our pastoral team would love to meet you! Would you like me to arrange a meet and greet with one of our pastors? They're always happy to answer questions and get to know visitors.`
  }
  
  if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
    return `We're located at ${church.address || 'our church address'}. We have plenty of parking and our facility is easily accessible. Would you like directions or information about what entrance to use?`
  }
  
  if (lowerMessage.includes('programs') || lowerMessage.includes('activities') || lowerMessage.includes('ministries')) {
    return `We have programs for all ages! This includes children's ministry, youth programs, adult classes, and various community outreach initiatives. Is there a specific age group or type of program you're interested in?`
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! Welcome to ${church.name}. I'm here to help answer any questions you might have about our church, services, or how to get involved. What would you like to know?`
  }
  
  // Default response
  return `Thank you for your message! I'd be happy to help you learn more about ${church.name}. You can ask me about our service times, programs, how to visit, or anything else you'd like to know about our church community.`
}