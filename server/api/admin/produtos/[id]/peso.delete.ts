import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverridePeso } from '../../../../utils/catalogo'

/** Remove a correção manual — o produto volta ao automático (regra do hortifruti). */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  await definirOverridePeso(produtoId, null)
  return { ok: true }
})
