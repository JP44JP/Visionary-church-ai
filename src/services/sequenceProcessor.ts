import { SequenceService } from './sequenceService'
import { createServerSupabaseClient } from '@/lib/supabase'

export class SequenceProcessor {
  private sequenceService = new SequenceService()
  private supabase = createServerSupabaseClient()
  private isRunning = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor(
    private options: {
      intervalMs?: number // How often to check for pending sequences
      batchSize?: number  // How many messages to process per batch
      maxRetries?: number // Max retries for failed messages
    } = {}
  ) {
    this.options = {
      intervalMs: 60000, // 1 minute
      batchSize: 100,
      maxRetries: 3,
      ...options
    }
  }

  start(): void {
    if (this.isRunning) {
      console.log('Sequence processor is already running')
      return
    }

    this.isRunning = true
    console.log(`Starting sequence processor with ${this.options.intervalMs}ms interval`)

    // Process immediately on start
    this.processAllTenants()

    // Set up recurring processing
    this.processingInterval = setInterval(() => {
      this.processAllTenants()
    }, this.options.intervalMs)
  }

  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }

    console.log('Sequence processor stopped')
  }

  async processAllTenants(): Promise<void> {
    try {
      // Get all active tenants
      const { data: tenants, error } = await this.supabase
        .from('shared.tenants')
        .select('schema_name, name')
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching tenants:', error)
        return
      }

      console.log(`Processing sequences for ${tenants?.length || 0} tenants`)

      // Process each tenant in parallel (with some concurrency limit)
      const concurrencyLimit = 5
      for (let i = 0; i < (tenants?.length || 0); i += concurrencyLimit) {
        const batch = tenants!.slice(i, i + concurrencyLimit)
        
        await Promise.allSettled(
          batch.map(tenant => this.processTenantSequences(tenant.schema_name, tenant.name))
        )
      }

    } catch (error) {
      console.error('Error in processAllTenants:', error)
    }
  }

  async processTenantSequences(tenantSchema: string, tenantName: string): Promise<void> {
    try {
      console.log(`Processing sequences for tenant: ${tenantName} (${tenantSchema})`)

      const result = await this.sequenceService.processSequences(
        tenantSchema,
        this.options.batchSize!
      )

      if (result.processed_count > 0 || result.failed_count > 0) {
        console.log(
          `${tenantName}: Processed ${result.processed_count} messages, ${result.failed_count} failures`
        )
      }

      // Handle retry logic for failed messages
      if (result.failed_count > 0) {
        await this.retryFailedMessages(tenantSchema)
      }

      // Update analytics
      await this.updateSequenceAnalytics(tenantSchema)

    } catch (error) {
      console.error(`Error processing sequences for tenant ${tenantName}:`, error)
    }
  }

  private async retryFailedMessages(tenantSchema: string): Promise<void> {
    try {
      // Get failed messages that haven't exceeded max retries
      const { data: failedMessages, error } = await this.supabase
        .from(`${tenantSchema}.sequence_messages`)
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', this.options.maxRetries!)
        .lte('failed_at', new Date(Date.now() - (5 * 60 * 1000)).toISOString()) // Wait 5 minutes before retry

      if (error) {
        console.error('Error fetching failed messages:', error)
        return
      }

      if (!failedMessages || failedMessages.length === 0) {
        return
      }

      console.log(`Retrying ${failedMessages.length} failed messages for ${tenantSchema}`)

      // Reset failed messages to pending for retry
      await this.supabase
        .from(`${tenantSchema}.sequence_messages`)
        .update({
          status: 'pending',
          retry_count: this.supabase.raw('retry_count + 1'),
          scheduled_for: new Date().toISOString(),
          error_message: null
        })
        .in('id', failedMessages.map(m => m.id))

    } catch (error) {
      console.error('Error in retryFailedMessages:', error)
    }
  }

  private async updateSequenceAnalytics(tenantSchema: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get today's sequence statistics
      const { data: sequences } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .select('id')
        .eq('is_active', true)

      if (!sequences) return

      for (const sequence of sequences) {
        // Calculate metrics for today
        const [
          { count: enrollments },
          { count: messagesSent },
          { count: messagesDelivered },
          { count: messagesOpened },
          { count: messagesClicked },
          { count: messagesBounced },
          { count: unsubscribes }
        ] = await Promise.all([
          // Enrollments today
          this.supabase
            .from(`${tenantSchema}.sequence_enrollments`)
            .select('id', { count: 'exact' })
            .eq('sequence_id', sequence.id)
            .gte('enrolled_at', today),
          
          // Messages sent today
          this.supabase
            .from(`${tenantSchema}.sequence_messages`)
            .select('id', { count: 'exact' })
            .eq('status', 'sent')
            .gte('sent_at', today),
          
          // Messages delivered today
          this.supabase
            .from(`${tenantSchema}.sequence_messages`)
            .select('id', { count: 'exact' })
            .eq('status', 'delivered')
            .gte('delivered_at', today),
          
          // Messages opened today
          this.supabase
            .from(`${tenantSchema}.sequence_messages`)
            .select('id', { count: 'exact' })
            .not('opened_at', 'is', null)
            .gte('opened_at', today),
          
          // Messages clicked today
          this.supabase
            .from(`${tenantSchema}.sequence_messages`)
            .select('id', { count: 'exact' })
            .not('clicked_at', 'is', null)
            .gte('clicked_at', today),
          
          // Messages bounced today
          this.supabase
            .from(`${tenantSchema}.sequence_messages`)
            .select('id', { count: 'exact' })
            .eq('status', 'bounced')
            .gte('bounced_at', today),
          
          // Unsubscribes today (this would need to be tracked in preferences table)
          { count: 0 } // Placeholder
        ])

        // Upsert analytics record
        await this.supabase
          .from(`${tenantSchema}.sequence_analytics`)
          .upsert({
            sequence_id: sequence.id,
            metric_date: today,
            enrollments: enrollments || 0,
            messages_sent: messagesSent || 0,
            messages_delivered: messagesDelivered || 0,
            messages_opened: messagesOpened || 0,
            messages_clicked: messagesClicked || 0,
            messages_bounced: messagesBounced || 0,
            unsubscribes: unsubscribes || 0,
            calculated_at: new Date().toISOString()
          }, {
            onConflict: 'sequence_id,metric_date'
          })
      }

    } catch (error) {
      console.error('Error updating sequence analytics:', error)
    }
  }

  // Manual processing trigger for specific tenant
  async processTenant(tenantSchema: string): Promise<{ processed: number; failed: number }> {
    const result = await this.sequenceService.processSequences(tenantSchema, this.options.batchSize!)
    await this.updateSequenceAnalytics(tenantSchema)
    return { processed: result.processed_count, failed: result.failed_count }
  }

  // Health check
  getStatus(): {
    isRunning: boolean
    intervalMs: number
    batchSize: number
    lastProcessed?: Date
  } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.options.intervalMs!,
      batchSize: this.options.batchSize!
    }
  }

  // Clean up old data
  async cleanupOldData(retentionDays: number = 90): Promise<void> {
    const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000))
    
    try {
      // Get all active tenants
      const { data: tenants } = await this.supabase
        .from('shared.tenants')
        .select('schema_name')
        .eq('status', 'active')

      for (const tenant of tenants || []) {
        // Clean up old messages
        await this.supabase
          .from(`${tenant.schema_name}.sequence_messages`)
          .delete()
          .lt('created_at', cutoffDate.toISOString())
          .neq('status', 'pending') // Keep pending messages

        // Clean up old analytics (keep longer retention)
        const analyticsRetentionDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)) // 1 year
        await this.supabase
          .from(`${tenant.schema_name}.sequence_analytics`)
          .delete()
          .lt('metric_date', analyticsRetentionDate.toISOString().split('T')[0])

        console.log(`Cleaned up old data for tenant: ${tenant.schema_name}`)
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error)
    }
  }
}

// Global processor instance
let globalProcessor: SequenceProcessor | null = null

export function startSequenceProcessor(options?: {
  intervalMs?: number
  batchSize?: number
  maxRetries?: number
}): SequenceProcessor {
  if (globalProcessor) {
    console.log('Sequence processor already started')
    return globalProcessor
  }

  globalProcessor = new SequenceProcessor(options)
  globalProcessor.start()
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down sequence processor...')
    globalProcessor?.stop()
    process.exit(0)
  })

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down sequence processor...')
    globalProcessor?.stop()
    process.exit(0)
  })

  return globalProcessor
}

export function getSequenceProcessor(): SequenceProcessor | null {
  return globalProcessor
}

export function stopSequenceProcessor(): void {
  if (globalProcessor) {
    globalProcessor.stop()
    globalProcessor = null
  }
}