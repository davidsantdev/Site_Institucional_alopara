import { defineEventHandler, getQuery } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { consultar, getCatalogo, produtoEstaOculto } from '../../utils/catalogo'

/** Busca em TODAS as categorias, incluindo ocultos — o admin precisa achá-los pra poder restaurar. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const query = getQuery(event)
  const busca = String(query.busca ?? '').slice(0, 100).trim()
  if (!busca)
    return { produtos: [], total: 0 }

  const catalogo = await getCatalogo()
  const resultado = consultar(catalogo, null, busca, 1, 30, { incluirOcultos: true })

  const produtos = resultado.produtos.map(p => ({ ...p, oculto: produtoEstaOculto(p.id) }))
  return { produtos, total: resultado.total }
})
