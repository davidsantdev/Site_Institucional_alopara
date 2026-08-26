import { defineEventHandler, getQuery } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { consultar, getCatalogo, produtoEstaOculto } from '../../utils/catalogo'

const POR_PAGINA = 30

const FILTROS_VALIDOS = ['sem-imagem', 'ocultos', 'sem-estoque'] as const
type Filtro = typeof FILTROS_VALIDOS[number]

function lerFiltro(valor: unknown): Filtro | undefined {
  return FILTROS_VALIDOS.includes(valor as Filtro) ? (valor as Filtro) : undefined
}

/**
 * Busca (ou lista por filtro rápido) em TODAS as categorias, incluindo ocultos
 * — o admin precisa achá-los pra poder restaurar. Paginado porque "sem imagem"
 * sozinho pode ter milhares de produtos.
 */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const query = getQuery(event)
  const busca = String(query.busca ?? '').slice(0, 100).trim()
  const filtro = lerFiltro(query.filtro)
  const pagina = Math.max(1, Number(query.pagina) || 1)

  // Nem busca nem filtro: não há o que listar (evita devolver o catálogo inteiro à toa).
  if (!busca && !filtro)
    return { produtos: [], total: 0, pagina: 1, totalPaginas: 1 }

  const catalogo = await getCatalogo()
  const resultado = consultar(catalogo, null, busca, pagina, POR_PAGINA, {
    incluirOcultos: true,
    incluirSemEstoque: true,
    somenteOcultos: filtro === 'ocultos',
    somenteSemEstoque: filtro === 'sem-estoque',
    semImagem: filtro === 'sem-imagem',
  })

  const produtos = resultado.produtos.map(p => ({ ...p, oculto: produtoEstaOculto(p.id) }))
  return {
    produtos,
    total: resultado.total,
    pagina: resultado.pagina,
    totalPaginas: resultado.totalPaginas,
  }
})
