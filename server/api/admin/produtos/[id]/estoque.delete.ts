import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverrideEstoque } from '../../../../utils/catalogo'

/** Remove a correção manual — o produto volta a usar o que a CISS informar sozinha. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  await definirOverrideEstoque(produtoId, null)
  return { ok: true }
})
