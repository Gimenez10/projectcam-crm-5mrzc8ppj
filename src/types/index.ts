import { Database, Json } from '@/lib/supabase/types'

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
export type Role = Database['public']['Tables']['roles']['Row'] & {
  permissions: string[]
}
export type Permission = Database['public']['Tables']['permissions']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  role?: Role | null
}
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
export type ServiceOrderStatus =
  Database['public']['Enums']['service_order_status']
export type ApprovalStatus = Database['public']['Enums']['approval_status']

// App-specific types
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
  actor_id: string | null
  actor_name: string | null
  action: string
  target_user_id: string | null
  target_user_name: string | null
  details: Json | null
  created_at: string
}
