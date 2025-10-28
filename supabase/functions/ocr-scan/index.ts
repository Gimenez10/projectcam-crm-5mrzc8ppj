import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // In a real-world scenario, you would process the image data from the request body.
    // For this mock implementation, we will return a simulated OCR result.
    // const { imageData } = await req.json();

    const extractedText = `MOCK-OCR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
