/**
 * Registra 1 clique em "Finalizar no WhatsApp" (ver app/pages/Carrinho.vue).
 * Rota pública de propósito — quem clica é cliente navegando, sem login.
 */
import { defineEventHandler, readBody } from 'h3'
import { registrarCliqueWhatsapp } from '../utils/cliquesWhatsapp'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ valorTotal?: number, quantidadeItens?: number }>(event)

  const valorTotal = Number(body?.valorTotal)
  const quantidadeItens = Number(body?.quantidadeItens)

  await registrarCliqueWhatsapp(
    Number.isFinite(valorTotal) ? valorTotal : 0,
    Number.isFinite(quantidadeItens) ? Math.max(0, Math.trunc(quantidadeItens)) : 0,
  )

  return { ok: true }
})
