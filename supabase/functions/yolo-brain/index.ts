const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_MODEL = 'gpt-6-luna'
const REASONING_MODEL = 'gpt-6-sol'

type BrainRequest = {
  message: string
  mode?: 'routine' | 'reasoning'
  context?: Record<string, unknown>
}

function extractText(payload: any): string {
  if (typeof payload?.output_text === 'string') return payload.output_text

  const parts: string[] = []
  for (const item of payload?.output ?? []) {
    if (item?.type !== 'message') continue
    for (const content of item?.content ?? []) {
      if (content?.type === 'output_text' && typeof content?.text === 'string') {
        parts.push(content.text)
      }
    }
  }
  return parts.join('\n').trim()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const body = (await req.json()) as BrainRequest
    const message = body?.message?.trim()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const model = body.mode === 'reasoning' ? REASONING_MODEL : DEFAULT_MODEL
    const context = body.context ?? {}

    const instructions = `You are YOLO Brain v0.1, an internal business intelligence assistant for The YOLO Studio.

Your job is to reduce founder cognitive load by turning trusted business context into priorities, risks, decisions and next actions.

Rules:
- Never invent business numbers, client facts, deadlines or team status.
- If information is missing, say exactly what is missing.
- Separate known facts from recommendations.
- Prefer 3 high-impact actions over long task lists.
- Do not claim to have sent messages, changed records, spent money or contacted anyone.
- Any external communication, financial commitment, pricing change, contract action or deletion requires human approval.
- Be concise, commercially aware and execution-focused.`

    const input = `BUSINESS CONTEXT:\n${JSON.stringify(context)}\n\nFOUNDER REQUEST:\n${message}`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        max_output_tokens: body.mode === 'reasoning' ? 1200 : 700,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      console.error('OpenAI error', response.status, payload)
      return new Response(
        JSON.stringify({ error: 'AI request failed', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        model,
        answer: extractText(payload),
        response_id: payload?.id ?? null,
        usage: payload?.usage ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: 'Unexpected server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
