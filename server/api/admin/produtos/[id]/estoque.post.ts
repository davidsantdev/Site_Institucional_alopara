import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverrideEstoque } from '../../../../utils/catalogo'

/** Corrige o estoque de um produto na mão — pra quando a CISS erra. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const body = await readBody(event)
  if (typeof body?.disponivel !== 'boolean')
    throw createError({ statusCode: 400, statusMessage: 'Campo "disponivel" (boolean) é obrigatório' })

  await definirOverrideEstoque(produtoId, body.disponivel)
  return { ok: true }
})
