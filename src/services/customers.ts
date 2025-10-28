import { supabase } from '@/lib/supabase/client'
import { Customer } from '@/types'

type CustomerPayload = Omit<Customer, 'id' | 'created_at' | 'created_by'>

type GetCustomersParams = {
  page?: number
  perPage?: number
  searchTerm?: string
  sort?: {
    column: string
    order: 'asc' | 'desc'
  }
}

export const getCustomers = async ({
  page = 1,
  perPage = 10,
  searchTerm = '',
  sort = { column: 'name', order: 'asc' },
}: GetCustomersParams): Promise<{ data: Customer[]; count: number }> => {
  let query = supabase.from('customers').select('*', { count: 'exact' })

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,cpf_cnpj.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
    )
  }

  query = query.order(sort.column, { ascending: sort.order === 'asc' })

  const startIndex = (page - 1) * perPage
  const endIndex = page * perPage - 1
  query = query.range(startIndex, endIndex)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return { data: [], count: 0 }
  }
  return { data: data as Customer[], count: count ?? 0 }
}

export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, cpf_cnpj, email')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all customers:', error)
    return []
  }
  return data as Customer[]
}

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer by ID:', error)
    return null
  }
  return data as Customer
}

export const createCustomer = async (
  customerData: CustomerPayload,
  creatorId: string,
) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{ ...customerData, created_by: creatorId }])
    .select()
    .single()
  return { data, error }
}

export const updateCustomer = async (
  id: string,
  customerData: Partial<CustomerPayload>,
) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  return { error }
}
