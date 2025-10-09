import { supabase } from '@/lib/supabase/client'
import { Product } from '@/types'

type ProductPayload = Omit<
  Product,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>

type GetProductsParams = {
  page?: number
  perPage?: number
  searchTerm?: string
  sort?: {
    column: string
    order: 'asc' | 'desc'
  }
}

export const getProducts = async ({
  page = 1,
  perPage = 10,
  searchTerm = '',
  sort = { column: 'name', order: 'asc' },
}: GetProductsParams): Promise<{ data: Product[]; count: number }> => {
  let query = supabase.from('products').select('*', { count: 'exact' })

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
  }

  query = query.order(sort.column, { ascending: sort.order === 'asc' })

  const startIndex = (page - 1) * perPage
  const endIndex = page * perPage - 1
  query = query.range(startIndex, endIndex)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { data: [], count: 0 }
  }
  return { data: data as Product[], count: count ?? 0 }
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product by ID:', error)
    return null
  }
  return data as Product
}

export const createProduct = async (
  productData: ProductPayload,
  creatorId: string,
) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...productData, created_by: creatorId }])
    .select()
    .single()
  return { data, error }
}

export const updateProduct = async (
  id: string,
  productData: Partial<ProductPayload>,
) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  return { error }
}
