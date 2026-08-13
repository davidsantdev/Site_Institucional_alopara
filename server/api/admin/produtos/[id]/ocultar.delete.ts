import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { ocultarProduto } from '../../../../utils/catalogo'

/** Restaura um produto removido — volta a aparecer no site na hora. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  await ocultarProduto(produtoId, false)
  return { ok: true }
})
