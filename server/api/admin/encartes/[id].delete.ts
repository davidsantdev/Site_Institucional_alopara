import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../utils/adminAuth'
import { removerEncarte } from '../../../utils/encartes'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'ID do encarte ausente' })

  const removido = await removerEncarte(id)
  if (!removido)
    throw createError({ statusCode: 404, statusMessage: 'Encarte não encontrado' })

  return { ok: true }
})
