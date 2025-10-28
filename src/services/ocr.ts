import { supabase } from '@/lib/supabase/client'

/**
 * Sends image data to the OCR Edge Function for text extraction.
 * @param imageData - The image data as a base64 string.
 * @returns An object with the extracted text or an error.
 */
export const scanImageWithOCR = async (imageData: string) => {
  const { data, error } = await supabase.functions.invoke('ocr-scan', {
    body: { imageData }, // The mock doesn't use this, but a real function would.
  })

  if (error) {
    console.error('Error calling OCR function:', error)
    return { text: null, error }
  }

  return { text: data.text as string, error: null }
}
