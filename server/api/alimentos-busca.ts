/**
 * Busca em alimentos.
 *
 * Antes: esta rota varria 30 páginas da API da CISS A CADA CHAMADA, sem cache
 * nenhum — ou seja, 30 requisições à origem por busca digitada. Era a fonte
 * mais agressiva de carga do site inteiro.
 *
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
    const { produtos } = consultar(catalogo, 'alimentos', busca, 1, LIMITE)

    setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
    return { produtos }
  }
  catch (err) {
    console.error('[api/alimentos-busca] erro:', err)
    return { produtos: [] }
  }
})
