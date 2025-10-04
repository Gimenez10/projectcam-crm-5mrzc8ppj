import { supabase } from '@/lib/supabase/client'
import { subMonths, startOfMonth, formatISO, format } from 'date-fns'
import { RecentActivity } from '@/types'

export const getKpiData = async () => {
  const { count: createdCount, error: createdError } = await supabase
    .from('service_orders')
    .select('*', { count: 'exact', head: true })

  const { data: salesData, error: salesError } = await supabase
    .from('service_orders')
    .select('total_value')
    .in('status', ['Aprovado', 'Fechado'])

  const { data: totalValueData, error: totalValueError } = await supabase
    .from('service_orders')
    .select('total_value')

  if (createdError || salesError || totalValueError) {
    console.error(
      'Error fetching KPI data:',
      createdError || salesError || totalValueError,
    )
    return null
  }

  const totalSales = salesData.reduce((sum, o) => sum + o.total_value, 0)
  const totalValue = totalValueData.reduce((sum, o) => sum + o.total_value, 0)

  const { data: conversionRateData, error: conversionRateError } =
    await supabase
      .from('service_orders')
      .select('status')
      .in('status', ['Fechado', 'Rejeitado'])

  let conversionRate = 0
  if (!conversionRateError && conversionRateData.length > 0) {
    const closed = conversionRateData.filter(
      (o) => o.status === 'Fechado',
    ).length
    conversionRate = (closed / conversionRateData.length) * 100
  }

  return {
    createdCount,
    totalSales,
    totalValue,
    conversionRate,
  }
}

export const getStatusDistribution = async () => {
  const { data, error } = await supabase.from('service_orders').select('status')

  if (error) {
    console.error('Error fetching status distribution:', error)
    return []
  }

  const counts = data.reduce(
    (acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export const getMonthlySales = async () => {
  const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11))
  const { data, error } = await supabase
    .from('service_orders')
    .select('created_at, total_value')
    .in('status', ['Aprovado', 'Fechado'])
    .gte('created_at', formatISO(twelveMonthsAgo))

  if (error) {
    console.error('Error fetching monthly sales:', error)
    return []
  }

  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      total: 0,
    }
  }).reverse()

  data.forEach((order) => {
    const orderDate = new Date(order.created_at)
    const monthName = orderDate.toLocaleString('default', { month: 'short' })
    const orderYear = orderDate.getFullYear()
    const monthIndex = monthlyTotals.findIndex(
      (m) => m.name === monthName && m.year === orderYear,
    )
    if (monthIndex !== -1) {
      monthlyTotals[monthIndex].total += order.total_value
    }
  })

  return monthlyTotals.map(({ name, total }) => ({ name, total }))
}

export const getTopCustomers = async () => {
  const { data, error } = await supabase
    .from('service_orders')
    .select('total_value, customer:customers(id, name)')
    .in('status', ['Aprovado', 'Fechado'])
    .not('customer', 'is', null)

  if (error) {
    console.error('Error fetching top customers:', error)
    return []
  }

  const customerTotals: Record<string, { name: string; value: number }> = {}
  data.forEach((order) => {
    if (order.customer) {
      const customerId = order.customer.id
      if (!customerTotals[customerId]) {
        customerTotals[customerId] = { name: order.customer.name, value: 0 }
      }
      customerTotals[customerId].value += order.total_value
    }
  })

  return Object.values(customerTotals)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

export const getSalesBySalesperson = async () => {
  const { data, error } = await supabase
    .from('service_orders')
    .select('id, salesperson:profiles(id, full_name)')
    .not('salesperson', 'is', null)

  if (error) {
    console.error('Error fetching sales by salesperson:', error)
    return []
  }

  const salespersonCounts: Record<string, { name: string; value: number }> = {}
  data.forEach((order) => {
    if (order.salesperson) {
      const salespersonId = order.salesperson.id
      if (!salespersonCounts[salespersonId]) {
        salespersonCounts[salespersonId] = {
          name: order.salesperson.full_name ?? 'N/A',
          value: 0,
        }
      }
      salespersonCounts[salespersonId].value += 1
    }
  })

  return Object.values(salespersonCounts)
}

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  const { data, error } = await supabase
    .from('service_orders')
    .select(
      'id, order_number, status, updated_at, salesperson:profiles(full_name)',
    )
    .order('updated_at', { ascending: false })
    .limit(2)

  if (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }

  return data.map((order, index) => ({
    id: `act-${index}`,
    description: `O.S. #${order.order_number} foi atualizada para ${order.status}.`,
    timestamp: format(new Date(order.updated_at), "dd/MM/yyyy 'às' HH:mm"),
    serviceOrderId: order.id,
  }))
}
