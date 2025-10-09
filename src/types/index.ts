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

// Dashboard Customization
export type LayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
}

export type WidgetConfig = {
  id: string
  component: string
}

export type DashboardLayout = {
  layout: LayoutItem[]
  widgets: WidgetConfig[]
}

// Database types
export type Role = Database['public']['Tables']['roles']['Row'] & {
  permissions: string[]
}
export type Permission = Database['public']['Tables']['permissions']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  role?: Role | null
  dashboard_layout?: DashboardLayout | null
}
export type Customer = Database['public']['Tables']['customers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
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

export type NotificationSetting = {
  id: string
  event_type: string
  description: string
  is_enabled: boolean
  recipients: {
    users: string[]
    roles: string[]
  }
  created_at: string
  updated_at: string
}
