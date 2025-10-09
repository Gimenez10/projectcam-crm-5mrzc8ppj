import { supabase } from '@/lib/supabase/client'
import { Product } from '@/types'

type ProductPayload = Omit<
  Product,
  'id' | 'created_at' | 'updated_at' | 'created_by'
>

export const getProducts = async (
  searchTerm: string = '',
): Promise<Product[]> => {
  let query = supabase.from('products').select('*')

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data as Product[]
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
