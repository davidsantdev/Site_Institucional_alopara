import type { Categoria, Ordenacao } from './catalogo'
import { defineEventHandler, getQuery, setHeader } from 'h3'
import { consultar, getCatalogo } from './catalogo'

const POR_PAGINA = 40

const ORDENACOES_VALIDAS: Ordenacao[] = ['relevancia', 'menor-preco', 'maior-preco', 'nome']

function lerOrdenacao(valor: unknown): Ordenacao | undefined {
  return ORDENACOES_VALIDAS.includes(valor as Ordenacao) ? (valor as Ordenacao) : undefined
}

/**
 * Constrói o handler de uma rota de categoria.
 *
 * Todas as rotas de produto são a mesma coisa: pegar o catálogo compartilhado,
 * filtrar por categoria + busca, paginar. Nenhuma delas fala com a origem.
 */
export function rotaCategoria(categoria: Categoria | Categoria[] | null, opcoesExtras: { somenteEmPromocao?: boolean } = {}) {
  return defineEventHandler(async (event) => {
    try {
      const query = getQuery(event)
      const pagina = Math.max(1, Number(query.pagina) || 1)
      const busca = String(query.busca ?? '').slice(0, 100)
      const tipo = query.tipo ? String(query.tipo).slice(0, 100) : undefined
      const ordenar = lerOrdenacao(query.ordenar)

      const catalogo = await getCatalogo()
      const resultado = consultar(catalogo, categoria, busca, pagina, POR_PAGINA, { tipo, ordenar, ...opcoesExtras })

      // Enquanto o catálogo está sendo construído a resposta muda rápido, então
      // cacheia pouco. Depois de completo, cacheia por muito mais tempo.
      setHeader(
        event,
        'Cache-Control',
        resultado.cacheCompleto
          ? 'public, max-age=300, stale-while-revalidate=3600'
          : 'public, max-age=10, stale-while-revalidate=60',
      )

      return resultado
    }
    catch (err) {
      console.error(`[api/${categoria ?? 'geral'}] erro:`, err)
      setHeader(event, 'Cache-Control', 'no-store')
      return {
        produtos: [],
        pagina: 1,
        total: 0,
        totalPaginas: 1,
        temMais: false,
        cacheCompleto: false,
        tipos: [],
      }
    }
  })
}
