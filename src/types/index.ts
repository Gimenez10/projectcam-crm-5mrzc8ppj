import { Database as SupabaseDatabase, Json } from '@/lib/supabase/types'

// Overriding Supabase-generated types because they are out of sync with migrations.
// This is the source of truth based on the applied migrations.

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
export type WidgetConfig = {
  id: string
}

export type DashboardLayout = {
  widgets: WidgetConfig[]
}

export type DashboardWidget = {
  id: string
  name: string
  description: string
}

// Database types based on migrations
export type Permission = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type Role = {
  id: string
  name: string
  description: string | null
  is_predefined: boolean
  created_at: string
  permissions: string[] // Array of permission IDs
}

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string
  role_id: string | null
  dashboard_layout: Json | null
  // For joined queries
  role?: { name: string } | null
}

export type CustomerLocalContact = {
  id?: string
  customer_id?: string
  name: string | null
  phone: string | null
  role: string | null
}

export type CustomerEmergencyContact = {
  id?: string
  customer_id?: string
  name: string | null
  relationship: string | null
  phone: string | null
}

export type CustomerPassword = {
  id?: string
  customer_id?: string
  question: string | null
  answer: string | null
  username: string | null
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type CustomerOperatingHours = {
  id?: string
  customer_id?: string
  day_of_week: DayOfWeek
  morning_open: string | null
  morning_close: string | null
  afternoon_open: string | null
  afternoon_close: string | null
  is_active: boolean
}

export type Customer =
  SupabaseDatabase['public']['Tables']['customers']['Row'] & {
    trade_name: string | null
    ie_rg: string | null
    line_of_business: string | null
    local_contacts?: CustomerLocalContact[]
    emergency_contacts?: CustomerEmergencyContact[]
    property_observations?: string | null
    property_type?: string | null
    property_local_key?: string | null
    property_animals?: string | null
    // New fields from migrations
    passwords?: CustomerPassword[]
    operating_hours?: CustomerOperatingHours[]
    system_time_entry?: string | null
    system_time_exit?: string | null
    system_time_test?: string | null
    system_time_interval?: string | null
    system_time_auto_arm?: string | null
    system_time_siren?: string | null
    equipment_central?: string | null
    equipment_version?: string | null
    equipment_model?: string | null
    equipment_purchase_lease?: string | null
    equipment_keyboard?: string | null
    equipment_siren?: string | null
    equipment_infra?: string | null
    equipment_magnet?: string | null
    equipment_central_phone?: string | null
    equipment_communication_ways?: string | null
    installation_team?: string | null
    responsible_name?: string | null
  }

export type Product = {
  id: string
  name: string
  description: string | null
  product_code: string
  barcode: string | null
  internal_code: string | null
  serial_number: string | null
  price: number | null
  stock: number | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export type ServiceOrderItem =
  SupabaseDatabase['public']['Tables']['service_order_items']['Row']

export type ServiceOrder =
  SupabaseDatabase['public']['Tables']['service_orders']['Row'] & {
    customer: Customer | null
    salesperson: Profile | null
    approver?: Profile | null
    items?: ServiceOrderItem[]
  }

// Enums from database
export type ServiceOrderStatus =
  SupabaseDatabase['public']['Enums']['service_order_status']
export type ApprovalStatus =
  SupabaseDatabase['public']['Enums']['approval_status']

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
  salesperson: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export type AuditLog = SupabaseDatabase['public']['Tables']['audit_logs']['Row']

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
