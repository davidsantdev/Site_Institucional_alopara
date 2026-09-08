import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../utils/adminAuth'
import { removerIndicacao } from '../../../utils/afiliados'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'ID da indicação ausente' })

  const removido = await removerIndicacao(id)
  if (!removido)
    throw createError({ statusCode: 404, statusMessage: 'Indicação não encontrada' })

  return { ok: true }
})
