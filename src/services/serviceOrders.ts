import { supabase } from '@/lib/supabase/client'
import { ServiceOrder } from '@/types'

type GetServiceOrdersParams = {
  page?: number
  perPage?: number
  filters?: {
    status?: string
    searchTerm?: string
    dateRange?: { from?: Date; to?: Date }
  }
  sort?: {
    column: string
    order: 'asc' | 'desc'
  }
}

export const getServiceOrders = async ({
  page = 1,
  perPage = 10,
  filters = {},
  sort = { column: 'created_at', order: 'desc' },
}: GetServiceOrdersParams): Promise<{
  data: ServiceOrder[]
  count: number
}> => {
  let query = supabase.from('service_orders').select(
    `
      id,
      order_number,
      status,
      total_value,
      created_at,
      customer:customers(id, name),
      salesperson:profiles(id, full_name)
    `,
    { count: 'exact' },
  )

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.searchTerm) {
    query = query.or(
      `customer.name.ilike.%${filters.searchTerm}%,salesperson.full_name.ilike.%${filters.searchTerm}%,order_number.eq.${Number.parseInt(filters.searchTerm, 10) || 0}`,
    )
  }

  if (filters.dateRange?.from) {
    query = query.gte('created_at', filters.dateRange.from.toISOString())
  }
  if (filters.dateRange?.to) {
    query = query.lte('created_at', filters.dateRange.to.toISOString())
  }

  query = query.order(sort.column, { ascending: sort.order === 'asc' })

  const startIndex = (page - 1) * perPage
  const endIndex = page * perPage - 1
  query = query.range(startIndex, endIndex)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching service orders:', error)
    return { data: [], count: 0 }
  }

  return {
    data: data.map((order: any) => ({
      ...order,
      customer: order.customer,
      salesperson: order.salesperson,
    })) as ServiceOrder[],
    count: count ?? 0,
  }
}

export const getServiceOrderById = async (
  id: string,
): Promise<ServiceOrder | null> => {
  const { data, error } = await supabase
    .from('service_orders')
    .select(
      `
      *,
      customer:customers(*),
      salesperson:profiles(*),
      items:service_order_items(*)
    `,
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching service order by ID:', error)
    return null
  }

  return {
    ...data,
    customer: data.customer,
    salesperson: data.salesperson,
    items: data.items,
  } as unknown as ServiceOrder
}
