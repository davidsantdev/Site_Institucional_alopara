/**
 * Conversa com a IA do assistente pelo formato "Chat Completions" da OpenAI —
 * o mesmo formato que o Gemini (Google) e o Groq aceitam. Trocar de uma pra
 * outra é só mudar as variáveis do .env, sem mexer em código:
 *
 *   ChatGPT (pago por uso):  ASSISTENTE_IA_URL=https://api.openai.com/v1
 *                            ASSISTENTE_IA_MODELO=gpt-5-mini
 *   Gemini (tem plano grátis): ASSISTENTE_IA_URL=https://generativelanguage.googleapis.com/v1beta/openai
 *                            ASSISTENTE_IA_MODELO=gemini-flash-lite-latest,gemini-flash-latest
 *
 * ASSISTENTE_IA_MODELO aceita uma lista separada por vírgula: usa o primeiro e,
 * se estiver sobrecarregado/fora do ar (comum no plano grátis), tenta o próximo.
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
/** Por tentativa — se um modelo travar, ainda sobra tempo pro próximo da lista. */
const TEMPO_MAXIMO_MS = 25_000

export function configIA() {
  const url = (process.env.ASSISTENTE_IA_URL || URL_PADRAO).replace(/\/+$/, '')
  return {
    url,
    chave: process.env.ASSISTENTE_IA_CHAVE || process.env.OPENAI_API_KEY || '',
    modelos: (process.env.ASSISTENTE_IA_MODELO || MODELO_PADRAO).split(',').map(m => m.trim()).filter(Boolean),
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

/** Sobrecarga, limite de uso, modelo aposentado ou fora do ar: vale tentar o próximo da lista. */
function valeTentarOutro(status: number): boolean {
  return status === 429 || status === 404 || status >= 500
}

/**
 * Uma rodada de conversa: devolve o texto e/ou as ferramentas que a IA quer usar.
 * `sessao.modelo` guarda quem respondeu na rodada anterior desta mesma mensagem —
 * as próximas rodadas ficam nele (o Gemini amarra a "assinatura de raciocínio"
 * das chamadas de ferramenta ao modelo que a gerou).
 */
export async function conversar(mensagens: MensagemIA[], ferramentas: FerramentaIA[], sessao: { modelo?: string } = {}) {
  const { url, chave, modelos, raciocinio } = configIA()
  const fila = sessao.modelo ? [sessao.modelo] : modelos
  let ultimoErro = new ErroIA('Nenhum modelo configurado', 500)

  for (const modelo of fila) {
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
        signal: AbortSignal.timeout(TEMPO_MAXIMO_MS),
      })
    }
    catch {
      console.error('[assistente]', modelo, 'não respondeu a tempo')
      ultimoErro = new ErroIA('A IA não respondeu a tempo', 504)
      continue
    }

    const bruto = await resposta.json().catch(() => ({}))
    // O Gemini às vezes manda o erro dentro de uma lista: [{ error: {...} }].
    const dados = (Array.isArray(bruto) ? bruto[0] : bruto) as RespostaChat
    if (!resposta.ok) {
      console.error('[assistente]', modelo, 'respondeu', resposta.status, dados?.error?.message ?? '')
      ultimoErro = new ErroIA(dados?.error?.message ?? 'Erro na IA', resposta.status)
      if (valeTentarOutro(resposta.status))
        continue
      throw ultimoErro
    }

    sessao.modelo = modelo
    const mensagem = dados?.choices?.[0]?.message
    return {
      texto: mensagem?.content?.trim() ?? '',
      chamadas: mensagem?.tool_calls ?? [],
    }
  }
  throw ultimoErro
}
