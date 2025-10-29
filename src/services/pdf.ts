import { supabase } from '@/lib/supabase/client'

/**
 * Calls the edge function to generate a PDF for a given customer.
 * @param customerId The ID of the customer.
 * @returns An object containing the signed URL for the PDF or an error.
 */
export const generateCustomerPdf = async (customerId: string) => {
  const { data, error } = await supabase.functions.invoke(
    'generate-customer-pdf',
    {
      body: { customerId },
    },
  )

  if (error) {
    console.error('Error invoking customer PDF function:', error)
    return { signedUrl: null, error }
  }

  if (data.error) {
    console.error('Error from customer PDF function:', data.error)
    return { signedUrl: null, error: new Error(data.error) }
  }

  return { signedUrl: data.signedUrl as string, error: null }
}

/**
 * Calls the edge function to generate a blank PDF form for a new customer.
 * @returns An object containing the signed URL for the PDF or an error.
 */
export const generateBlankCustomerFormPdf = async () => {
  const { data, error } = await supabase.functions.invoke(
    'generate-blank-customer-form-pdf',
  )

  if (error) {
    console.error('Error invoking blank form PDF function:', error)
    return { signedUrl: null, error }
  }

  if (data.error) {
    console.error('Error from blank form PDF function:', data.error)
    return { signedUrl: null, error: new Error(data.error) }
  }

  return { signedUrl: data.signedUrl as string, error: null }
}
