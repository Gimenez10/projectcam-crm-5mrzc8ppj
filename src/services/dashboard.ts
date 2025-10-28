import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { RecentActivity } from '@/types'

export const getKpiData = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_kpi_data')

  if (error) {
    console.error('Error fetching KPI data:', error)
    return null
  }
  return data
}

export const getStatusDistribution = async () => {
  const { data, error } = await supabase.rpc(
    'get_dashboard_status_distribution',
  )

  if (error) {
    console.error('Error fetching status distribution:', error)
    return []
  }
  return data || []
}

export const getMonthlySales = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_monthly_sales')

  if (error) {
    console.error('Error fetching monthly sales:', error)
    return []
  }
  return data || []
}

export const getTopCustomers = async () => {
  const { data, error } = await supabase.rpc('get_dashboard_top_customers')

  if (error) {
    console.error('Error fetching top customers:', error)
    return []
  }
  return data || []
}

export const getSalesBySalesperson = async () => {
  const { data, error } = await supabase.rpc(
    'get_dashboard_sales_by_salesperson',
  )

  if (error) {
    console.error('Error fetching sales by salesperson:', error)
    return []
  }
  return data || []
}

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  const { data, error } = await supabase.rpc('get_dashboard_recent_activities')

  if (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }

  if (!data) return []

  return data.map((order: any) => ({
    id: order.id,
    description: `O.S. #${order.order_number} foi atualizada para ${order.status}.`,
    timestamp: format(new Date(order.updated_at), "dd/MM/yyyy 'às' HH:mm"),
    serviceOrderId: order.id,
    salesperson: order.salesperson,
  }))
}
