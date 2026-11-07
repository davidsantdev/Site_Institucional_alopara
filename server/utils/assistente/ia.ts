/**
 * Conversa com a IA do assistente pelo formato "Chat Completions" da OpenAI —
 * o mesmo formato que o Gemini (Google) e o Groq aceitam. Trocar de uma pra
 * outra é só mudar as variáveis do .env, sem mexer em código:
 *
 *   ChatGPT (pago por uso):  ASSISTENTE_IA_URL=https://api.openai.com/v1
 *                            ASSISTENTE_IA_MODELO=gpt-5-mini
 *   Gemini (tem plano grátis): ASSISTENTE_IA_URL=https://generativelanguage.googleapis.com/v1beta/openai
 *                            ASSISTENTE_IA_MODELO=gemini-2.5-flash
 *
 * A chave fica em ASSISTENTE_IA_CHAVE (só no .env do servidor, nunca no GitHub).
 */
import process from 'node:process'

export interface ChamadaFerramenta {
  id: string
  type: 'function'
  function: { name: string, arguments: string }
}

export type MensagemIA
  = | { role: 'system', content: string }
    | { role: 'user', content: string }
    | { role: 'assistant', content: string | null, tool_calls?: ChamadaFerramenta[] }
    | { role: 'tool', tool_call_id: string, content: string }

export interface FerramentaIA {
  type: 'function'
  function: { name: string, description: string, parameters: Record<string, unknown> }
}

interface RespostaChat {
  choices?: { message?: { content?: string | null, tool_calls?: ChamadaFerramenta[] }, finish_reason?: string }[]
  error?: { message?: string }
}

const URL_PADRAO = 'https://api.openai.com/v1'
const MODELO_PADRAO = 'gpt-5-mini'

export function configIA() {
  const url = (process.env.ASSISTENTE_IA_URL || URL_PADRAO).replace(/\/+$/, '')
  return {
    url,
    chave: process.env.ASSISTENTE_IA_CHAVE || process.env.OPENAI_API_KEY || '',
    modelo: process.env.ASSISTENTE_IA_MODELO || MODELO_PADRAO,
    // "low" deixa o modelo pensar o suficiente pra fazer conta de orçamento sem demorar.
    // Vazio = não manda o parâmetro (pra provedor/modelo que não aceita).
    raciocinio: process.env.ASSISTENTE_IA_RACIOCINIO ?? (url === URL_PADRAO ? 'low' : ''),
  }
}

export function iaConfigurada(): boolean {
  return Boolean(configIA().chave)
}

export class ErroIA extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

/** Uma rodada de conversa: devolve o texto e/ou as ferramentas que a IA quer usar. */
export async function conversar(mensagens: MensagemIA[], ferramentas: FerramentaIA[]) {
  const { url, chave, modelo, raciocinio } = configIA()
  let resposta: Response
  try {
    resposta = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${chave}` },
      body: JSON.stringify({
        model: modelo,
        messages: mensagens,
        tools: ferramentas,
        tool_choice: 'auto',
        ...(raciocinio ? { reasoning_effort: raciocinio } : {}),
      }),
      signal: AbortSignal.timeout(45_000),
    })
  }
  catch {
    throw new ErroIA('A IA não respondeu a tempo', 504)
  }

  const dados = await resposta.json().catch(() => ({})) as RespostaChat
  if (!resposta.ok) {
    console.error('[assistente] IA respondeu', resposta.status, dados?.error?.message ?? '')
    throw new ErroIA(dados?.error?.message ?? 'Erro na IA', resposta.status)
  }

  const mensagem = dados.choices?.[0]?.message
  return {
    texto: mensagem?.content?.trim() ?? '',
    chamadas: mensagem?.tool_calls ?? [],
  }
}
