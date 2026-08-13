import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { ocultarProduto } from '../../../../utils/catalogo'

/** Remove o produto do site (some das rotas públicas — continua existindo na CISS). */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  await ocultarProduto(produtoId, true)
  return { ok: true }
})
