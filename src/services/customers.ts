import { supabase } from '@/lib/supabase/client'
import { Customer } from '@/types'

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
    .select(
      `
      *,
      local_contacts:customer_local_contacts(*),
      emergency_contacts:customer_emergency_contacts(*)
    `,
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer by ID:', error)
    return null
  }
  return data as Customer
}

export const createCustomer = async (
  customerData: Omit<Customer, 'id' | 'created_at' | 'created_by'>,
  creatorId: string,
) => {
  const { local_contacts, emergency_contacts, ...mainCustomerData } =
    customerData

  const { data: newCustomer, error: customerError } = await supabase
    .from('customers')
    .insert([{ ...mainCustomerData, created_by: creatorId }])
    .select()
    .single()

  if (customerError) return { data: null, error: customerError }

  const customerId = newCustomer.id

  if (local_contacts && local_contacts.length > 0) {
    const toInsert = local_contacts
      .filter((c) => c.name || c.phone || c.role)
      .map((contact) => ({ ...contact, customer_id: customerId }))
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('customer_local_contacts')
        .insert(toInsert)
      if (error) {
        await supabase.from('customers').delete().eq('id', customerId)
        return { data: null, error }
      }
    }
  }

  if (emergency_contacts && emergency_contacts.length > 0) {
    const toInsert = emergency_contacts
      .filter((c) => c.name || c.phone || c.relationship)
      .map((contact) => ({ ...contact, customer_id: customerId }))
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('customer_emergency_contacts')
        .insert(toInsert)
      if (error) {
        await supabase.from('customers').delete().eq('id', customerId)
        return { data: null, error }
      }
    }
  }

  return { data: newCustomer, error: null }
}

export const updateCustomer = async (
  id: string,
  customerData: Partial<Customer>,
) => {
  const { local_contacts, emergency_contacts, ...mainCustomerData } =
    customerData

  const { data, error } = await supabase
    .from('customers')
    .update(mainCustomerData)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error }

  if (local_contacts) {
    await supabase
      .from('customer_local_contacts')
      .delete()
      .eq('customer_id', id)
    const toInsert = local_contacts
      .filter((c) => c.name || c.phone || c.role)
      .map((contact) => ({ ...contact, customer_id: id }))
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('customer_local_contacts')
        .insert(toInsert)
      if (insertError) return { data: null, error: insertError }
    }
  }

  if (emergency_contacts) {
    await supabase
      .from('customer_emergency_contacts')
      .delete()
      .eq('customer_id', id)
    const toInsert = emergency_contacts
      .filter((c) => c.name || c.phone || c.relationship)
      .map((contact) => ({ ...contact, customer_id: id }))
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('customer_emergency_contacts')
        .insert(toInsert)
      if (insertError) return { data: null, error: insertError }
    }
  }

  return { data, error: null }
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  return { error }
}
