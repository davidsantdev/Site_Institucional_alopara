import { defineEventHandler, getQuery } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { consultar, getCatalogo } from '../../utils/catalogo'

/** Busca em TODAS as categorias — o admin pode querer editar qualquer produto. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const query = getQuery(event)
  const busca = String(query.busca ?? '').slice(0, 100).trim()
  if (!busca)
    return { produtos: [], total: 0 }

  const catalogo = await getCatalogo()
  const resultado = consultar(catalogo, null, busca, 1, 30, {})
  return { produtos: resultado.produtos, total: resultado.total }
})
