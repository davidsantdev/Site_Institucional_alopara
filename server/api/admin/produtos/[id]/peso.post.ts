import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverridePeso } from '../../../../utils/catalogo'

/** Corrige na mão se um produto é vendido por peso (preço por KG + escolha de gramas) ou por unidade. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const body = await readBody(event)
  if (typeof body?.pesavel !== 'boolean')
    throw createError({ statusCode: 400, statusMessage: 'Campo "pesavel" (boolean) é obrigatório' })

  await definirOverridePeso(produtoId, body.pesavel)
  return { ok: true }
})
