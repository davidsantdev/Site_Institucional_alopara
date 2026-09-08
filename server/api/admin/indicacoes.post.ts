import { createError, defineEventHandler, readBody } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { registrarIndicacao } from '../../utils/afiliados'

/** O admin registra na mão a venda que o atendente confirmou pelo código no WhatsApp. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const body = await readBody<{ codigo?: string, valorCompra?: number, observacao?: string }>(event)

  try {
    const indicacao = await registrarIndicacao(
      body?.codigo ?? '',
      Number(body?.valorCompra),
      body?.observacao,
    )
    return { ok: true, indicacao }
  }
  catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.message || 'Erro ao registrar indicação' })
  }
})
