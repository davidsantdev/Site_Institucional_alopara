/**
 * Busca em limpeza + higiene/perfumaria.
 *
 * Antes: varria 30 páginas da API da CISS a cada chamada, sem cache.
 * Agora: filtra o catálogo compartilhado em memória. Zero requisições à origem.
 */
import { defineEventHandler, getQuery, setHeader } from 'h3'
import { consultar, getCatalogo } from '../utils/catalogo'

const LIMITE = 100

export default defineEventHandler(async (event) => {
  try {
    const busca = String(getQuery(event).busca ?? '').slice(0, 100).trim()
    if (!busca)
      return { produtos: [] }

    const catalogo = await getCatalogo()
    const { produtos } = consultar(catalogo, ['limpeza', 'perfumaria'], busca, 1, LIMITE)

    setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return { produtos }
  }
  catch (err) {
    console.error('[api/limpeza-busca] erro:', err)
    return { produtos: [] }
  }
})
