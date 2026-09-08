import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../utils/adminAuth'
import { removerAfiliado } from '../../../utils/afiliados'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'ID do afiliado ausente' })

  const removido = await removerAfiliado(id)
  if (!removido)
    throw createError({ statusCode: 404, statusMessage: 'Afiliado não encontrado' })

  return { ok: true }
})
