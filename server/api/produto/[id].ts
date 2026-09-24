/**
 * Um produto só (página /produto/[id]) + similares. Lê do catálogo em memória —
 * nenhuma requisição à origem. Sem Cache-Control de propósito: preço e estoque
 * mudam (admin marca sem estoque na hora) e a leitura já é barata.
 */
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { buscarProduto, categoriaPrincipal, getCatalogo, similaresDe } from '../../utils/catalogo'

export default defineEventHandler(async (event) => {
  // A URL é "<id>-<slug-do-nome>" (o slug é só pra ficar bonito/indexável) — o id é o que vem antes do 1º hífen.
  const id = (getRouterParam(event, 'id') ?? '').split('-')[0]!.slice(0, 40)
  if (!id)
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const catalogo = await getCatalogo()
  const produto = buscarProduto(catalogo, id)
  if (!produto)
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  return {
    produto,
    categoria: categoriaPrincipal(produto),
    similares: similaresDe(catalogo, produto),
  }
})
