export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          website: string | null
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          banner_url: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          banner_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          banner_url?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          church_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          church_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          church_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_church_id_fkey'
            columns: ['church_id']
            referencedRelation: 'churches'
            referencedColumns: ['id']
          }
        ]
      }
      visitors: {
        Row: {
          id: string
          email: string | null
          full_name: string
          phone: string | null
          address: string | null
          age_group: string | null
          family_size: number | null
          interests: string[] | null
          how_heard_about: string | null
          previous_church_experience: boolean | null
          prayer_requests: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          full_name: string
          phone?: string | null
          address?: string | null
          age_group?: string | null
          family_size?: number | null
          interests?: string[] | null
          how_heard_about?: string | null
          previous_church_experience?: boolean | null
          prayer_requests?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string
          phone?: string | null
          address?: string | null
          age_group?: string | null
          family_size?: number | null
          interests?: string[] | null
          how_heard_about?: string | null
          previous_church_experience?: boolean | null
          prayer_requests?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          id: string
          church_id: string
          visitor_id: string
          scheduled_date: string
          scheduled_time: string
          status: Database['public']['Enums']['visit_status']
          type: Database['public']['Enums']['visit_type']
          notes: string | null
          staff_assigned: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          visitor_id: string
          scheduled_date: string
          scheduled_time: string
          status?: Database['public']['Enums']['visit_status']
          type: Database['public']['Enums']['visit_type']
          notes?: string | null
          staff_assigned?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          visitor_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: Database['public']['Enums']['visit_status']
          type?: Database['public']['Enums']['visit_type']
          notes?: string | null
          staff_assigned?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'visits_church_id_fkey'
            columns: ['church_id']
            referencedRelation: 'churches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'visits_visitor_id_fkey'
            columns: ['visitor_id']
            referencedRelation: 'visitors'
            referencedColumns: ['id']
          }
        ]
      }
      chat_sessions: {
        Row: {
          id: string
          church_id: string
          visitor_id: string | null
          messages: Json
          status: 'active' | 'ended'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          visitor_id?: string | null
          messages?: Json
          status?: 'active' | 'ended'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          visitor_id?: string | null
          messages?: Json
          status?: 'active' | 'ended'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_sessions_church_id_fkey'
            columns: ['church_id']
            referencedRelation: 'churches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_sessions_visitor_id_fkey'
            columns: ['visitor_id']
            referencedRelation: 'visitors'
            referencedColumns: ['id']
          }
        ]
      }
      events: {
        Row: {
          id: string
          church_id: string
          title: string
          description: string | null
          location: string
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          timezone: string
          event_type: Database['public']['Enums']['event_type']
          category: string
          capacity: number | null
          cost: number | null
          cost_type: Database['public']['Enums']['cost_type']
          age_groups: string[] | null
          audience_type: Database['public']['Enums']['audience_type']
          registration_required: boolean
          registration_deadline: string | null
          waitlist_enabled: boolean
          is_recurring: boolean
          recurrence_pattern: Json | null
          status: Database['public']['Enums']['event_status']
          image_url: string | null
          settings: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          title: string
          description?: string | null
          location: string
          start_date: string
          end_date: string
          start_time: string
          end_time: string
          timezone?: string
          event_type: Database['public']['Enums']['event_type']
          category: string
          capacity?: number | null
          cost?: number | null
          cost_type?: Database['public']['Enums']['cost_type']
          age_groups?: string[] | null
          audience_type?: Database['public']['Enums']['audience_type']
          registration_required?: boolean
          registration_deadline?: string | null
          waitlist_enabled?: boolean
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          status?: Database['public']['Enums']['event_status']
          image_url?: string | null
          settings?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          title?: string
          description?: string | null
          location?: string
          start_date?: string
          end_date?: string
          start_time?: string
          end_time?: string
          timezone?: string
          event_type?: Database['public']['Enums']['event_type']
          category?: string
          capacity?: number | null
          cost?: number | null
          cost_type?: Database['public']['Enums']['cost_type']
          age_groups?: string[] | null
          audience_type?: Database['public']['Enums']['audience_type']
          registration_required?: boolean
          registration_deadline?: string | null
          waitlist_enabled?: boolean
          is_recurring?: boolean
          recurrence_pattern?: Json | null
          status?: Database['public']['Enums']['event_status']
          image_url?: string | null
          settings?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_church_id_fkey'
            columns: ['church_id']
            referencedRelation: 'churches'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'events_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          visitor_id: string | null
          registration_type: Database['public']['Enums']['registration_type']
          status: Database['public']['Enums']['registration_status']
          attendee_count: number
          guest_details: Json | null
          custom_fields: Json | null
          payment_status: Database['public']['Enums']['payment_status']
          payment_amount: number | null
          payment_reference: string | null
          checked_in: boolean
          check_in_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          visitor_id?: string | null
          registration_type: Database['public']['Enums']['registration_type']
          status?: Database['public']['Enums']['registration_status']
          attendee_count?: number
          guest_details?: Json | null
          custom_fields?: Json | null
          payment_status?: Database['public']['Enums']['payment_status']
          payment_amount?: number | null
          payment_reference?: string | null
          checked_in?: boolean
          check_in_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          visitor_id?: string | null
          registration_type?: Database['public']['Enums']['registration_type']
          status?: Database['public']['Enums']['registration_status']
          attendee_count?: number
          guest_details?: Json | null
          custom_fields?: Json | null
          payment_status?: Database['public']['Enums']['payment_status']
          payment_amount?: number | null
          payment_reference?: string | null
          checked_in?: boolean
          check_in_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_registrations_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_visitor_id_fkey'
            columns: ['visitor_id']
            referencedRelation: 'visitors'
            referencedColumns: ['id']
          }
        ]
      }
      event_volunteers: {
        Row: {
          id: string
          event_id: string
          user_id: string
          role: string
          description: string | null
          requirements: string[] | null
          capacity: number | null
          status: Database['public']['Enums']['volunteer_status']
          hours_served: number | null
          check_in_time: string | null
          check_out_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          role: string
          description?: string | null
          requirements?: string[] | null
          capacity?: number | null
          status?: Database['public']['Enums']['volunteer_status']
          hours_served?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          role?: string
          description?: string | null
          requirements?: string[] | null
          capacity?: number | null
          status?: Database['public']['Enums']['volunteer_status']
          hours_served?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_volunteers_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_volunteers_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      event_resources: {
        Row: {
          id: string
          event_id: string
          resource_type: Database['public']['Enums']['resource_type']
          name: string
          description: string | null
          quantity_needed: number
          quantity_confirmed: number
          booking_status: Database['public']['Enums']['booking_status']
          vendor_contact: string | null
          cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          resource_type: Database['public']['Enums']['resource_type']
          name: string
          description?: string | null
          quantity_needed?: number
          quantity_confirmed?: number
          booking_status?: Database['public']['Enums']['booking_status']
          vendor_contact?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          resource_type?: Database['public']['Enums']['resource_type']
          name?: string
          description?: string | null
          quantity_needed?: number
          quantity_confirmed?: number
          booking_status?: Database['public']['Enums']['booking_status']
          vendor_contact?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_resources_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          }
        ]
      }
      event_communications: {
        Row: {
          id: string
          event_id: string
          communication_type: Database['public']['Enums']['communication_type']
          channel: Database['public']['Enums']['communication_channel']
          subject: string
          content: string
          recipients: Json
          scheduled_time: string | null
          sent_time: string | null
          status: Database['public']['Enums']['communication_status']
          metadata: Json | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          communication_type: Database['public']['Enums']['communication_type']
          channel: Database['public']['Enums']['communication_channel']
          subject: string
          content: string
          recipients: Json
          scheduled_time?: string | null
          sent_time?: string | null
          status?: Database['public']['Enums']['communication_status']
          metadata?: Json | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          communication_type?: Database['public']['Enums']['communication_type']
          channel?: Database['public']['Enums']['communication_channel']
          subject?: string
          content?: string
          recipients?: Json
          scheduled_time?: string | null
          sent_time?: string | null
          status?: Database['public']['Enums']['communication_status']
          metadata?: Json | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_communications_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_communications_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      event_attendance: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          visitor_id: string | null
          registration_id: string | null
          attendance_status: Database['public']['Enums']['attendance_status']
          check_in_method: Database['public']['Enums']['check_in_method']
          check_in_time: string
          check_out_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          visitor_id?: string | null
          registration_id?: string | null
          attendance_status: Database['public']['Enums']['attendance_status']
          check_in_method: Database['public']['Enums']['check_in_method']
          check_in_time: string
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          visitor_id?: string | null
          registration_id?: string | null
          attendance_status?: Database['public']['Enums']['attendance_status']
          check_in_method?: Database['public']['Enums']['check_in_method']
          check_in_time?: string
          check_out_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_attendance_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_attendance_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_attendance_visitor_id_fkey'
            columns: ['visitor_id']
            referencedRelation: 'visitors'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_attendance_registration_id_fkey'
            columns: ['registration_id']
            referencedRelation: 'event_registrations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'church_admin' | 'staff' | 'member' | 'visitor'
      visit_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      visit_type: 'first_time' | 'returning' | 'prayer' | 'counseling' | 'baptism' | 'membership'
      event_type: 'worship' | 'bible_study' | 'prayer' | 'fellowship' | 'outreach' | 'youth' | 'children' | 'ministry' | 'special' | 'conference' | 'retreat' | 'wedding' | 'funeral' | 'other'
      cost_type: 'free' | 'paid' | 'donation' | 'suggested_donation'
      audience_type: 'all' | 'members' | 'visitors' | 'youth' | 'children' | 'adults' | 'seniors' | 'families' | 'men' | 'women'
      event_status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed'
      registration_type: 'individual' | 'group' | 'family'
      registration_status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'no_show'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'waived'
      volunteer_status: 'interested' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
      resource_type: 'facility' | 'equipment' | 'catering' | 'supplies' | 'transport' | 'other'
      booking_status: 'requested' | 'confirmed' | 'cancelled' | 'pending'
      communication_type: 'announcement' | 'reminder' | 'update' | 'cancellation' | 'thank_you' | 'feedback_request'
      communication_channel: 'email' | 'sms' | 'push_notification' | 'in_app'
      communication_status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled'
      attendance_status: 'present' | 'absent' | 'late' | 'early_departure'
      check_in_method: 'qr_code' | 'manual' | 'mobile_app' | 'kiosk'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}