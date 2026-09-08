import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../utils/adminAuth'
import { alternarStatusIndicacao } from '../../../utils/afiliados'

/** Alterna pendente ↔ pago — é o admin marcando que já acertou com o afiliado. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'ID da indicação ausente' })

  const indicacao = await alternarStatusIndicacao(id)
  if (!indicacao)
    throw createError({ statusCode: 404, statusMessage: 'Indicação não encontrada' })

  return { ok: true, indicacao }
})
