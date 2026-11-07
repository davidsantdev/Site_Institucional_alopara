/**
 * Assistente de compras (ver server/utils/assistente/assistente.ts). Rota
 * pública — quem usa é o cliente navegando —, por isso tudo que entra é
 * cortado/validado e o uso tem limite (limite.ts).
 */
import type { ItemCarrinhoCliente, MensagemHistorico } from '../../utils/assistente/assistente'
import { createError, defineEventHandler, getRequestIP, readBody, setHeader } from 'h3'
import { responder } from '../../utils/assistente/assistente'
import { ErroIA, iaConfigurada } from '../../utils/assistente/ia'
import { verificarLimite } from '../../utils/assistente/limite'

const MAX_HISTORICO = 12
const MAX_TEXTO_CLIENTE = 500
const MAX_TEXTO_ASSISTENTE = 1500
const MAX_ITENS_CARRINHO = 100

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  if (!iaConfigurada())
    throw createError({ statusCode: 503, statusMessage: 'Assistente desligado' })

  const body = await readBody<{ historico?: unknown, carrinho?: unknown }>(event)

  const historico: MensagemHistorico[] = (Array.isArray(body?.historico) ? body.historico : [])
    .slice(-MAX_HISTORICO)
    .filter((m: any) => (m?.papel === 'cliente' || m?.papel === 'assistente') && typeof m?.texto === 'string' && m.texto.trim())
    .map((m: any) => ({
      papel: m.papel,
      texto: m.texto.trim().slice(0, m.papel === 'cliente' ? MAX_TEXTO_CLIENTE : MAX_TEXTO_ASSISTENTE),
    }))
  // A conversa tem que começar pelo cliente e terminar com a mensagem nova dele.
  while (historico.length && historico[0]!.papel !== 'cliente')
    historico.shift()
  if (!historico.length || historico.at(-1)!.papel !== 'cliente')
    throw createError({ statusCode: 400, statusMessage: 'Mensagem vazia' })

  const carrinho: ItemCarrinhoCliente[] = (Array.isArray(body?.carrinho) ? body.carrinho : [])
    .slice(0, MAX_ITENS_CARRINHO)
    .filter((i: any) => typeof i?.nome === 'string')
    .map((i: any) => ({
      nome: i.nome.slice(0, 200),
      quantidade: Math.max(0, Number(i.quantidade) || 0),
      preco: Math.max(0, Number(i.preco) || 0),
      pesavel: Boolean(i.pesavel),
    }))

  const bloqueio = verificarLimite(getRequestIP(event, { xForwardedFor: true }) ?? 'desconhecido')
  if (bloqueio)
    return { mensagem: bloqueio, adicionar: [], remover: [] }

  try {
    return await responder(historico, carrinho)
  }
  catch (err) {
    if (!(err instanceof ErroIA))
      console.error('[assistente] erro:', err)
    return {
      mensagem: 'Tive um probleminha agora e não consegui responder. Tenta de novo em instantes?',
      adicionar: [],
      remover: [],
      erro: true,
    }
  }
})
