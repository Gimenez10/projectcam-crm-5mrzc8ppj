import { supabase } from '@/lib/supabase/client'
import { ServiceOrder } from '@/types'

export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
  const { data, error } = await supabase.from('service_orders').select(`
      id,
      order_number,
      status,
      total_value,
      created_at,
      customer:customers(id, name),
      salesperson:profiles(id, full_name)
    `)

  if (error) {
    console.error('Error fetching service orders:', error)
    return []
  }

  return data.map((order: any) => ({
    ...order,
    customer: order.customer,
    salesperson: order.salesperson,
  })) as ServiceOrder[]
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
