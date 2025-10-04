import { Database } from './lib/supabase/types'

// Auth
export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = {
  fullName: string
  email: string
  password: string
}

// Database types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type ServiceOrder =
  Database['public']['Tables']['service_orders']['Row'] & {
    customer: Customer | null
    salesperson: Profile | null
    items?: ServiceOrderItem[]
  }
export type ServiceOrderItem =
  Database['public']['Tables']['service_order_items']['Row']

// Enums from database
export type UserRole = Database['public']['Enums']['user_role']
export type ServiceOrderStatus =
  Database['public']['Enums']['service_order_status']
export type ApprovalStatus = Database['public']['Enums']['approval_status']

// App-specific types (can be removed if not needed)
export type KpiCardData = {
  title: string
  value: string
  change: number
  period: string
  chartData: { value: number }[]
}

export type RecentActivity = {
  id: string
  description: string
  timestamp: string
  serviceOrderId: string
}

export type AuditLog = {
  id: string
  user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  action: string
  details: string
  timestamp: Date
}
