import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { prompt } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    // Ganti baris fetch kamu dengan ini:
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ 
        text: `Kamu adalah asisten pintar PTSP Kemenag Gorontalo. 
        Layanan kami: Permintaan Data, Rohaniawan, Permintaan Kesediaan, Perubahan SIRUP, dan Rekomendasi. 
        Jawablah dengan ramah dan singkat. Pertanyaan pengguna: ${prompt}`
      }]
    }]
  })
})

    const data = await response.json()

    if (data.error) {
      return new Response(JSON.stringify({ answer: "Google API Error: " + data.error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const result =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "Maaf, AI tidak memberikan jawaban."
    return new Response(JSON.stringify({ answer: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    return new Response(JSON.stringify({ answer: "Sistem Error: " + error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})