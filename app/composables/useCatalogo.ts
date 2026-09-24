/**
 * Lógica compartilhada das páginas de produto.
 *
 * As 4 páginas (Alimentos, Bebidas, Limpeza, Perfumaria) eram cópias quase
 * idênticas de ~180 linhas de script cada. Além da duplicação, cada uma fazia
 * polling num intervalo fixo (800ms na Perfumaria, 1500ms nas outras) que:
 *   - nunca pausava com a aba em segundo plano;
 *   - nunca desistia em caso de erro;
 *   - não cancelava requisições em voo ao trocar de página/busca.
 *
 * Uma aba aberta valia até 75 requisições/min ao servidor. Aqui isso vira
 * backoff progressivo, com teto de tentativas e pausa automática.
 */
import { computed, onUnmounted, ref, watch } from 'vue'

export interface Produto {
  id: string
  nome: string
  preco2: string
  /** Preço "de" — igual a `preco2` quando não há promoção ativa. */
  precoOriginal: string
  emPromocao: boolean
  tipo: string
  img: string
  /** true só quando a foto foi confirmada — foto "adivinhada" que não existe no CDN vem false. */
  imagemReal?: boolean
  /** Emoji do hortifruti, usado no lugar da foto quando `imagemReal` é falso (ver FotoProduto). */
  emoji?: string
  /** Vendido por peso: `preco2` é por KG e a `quantidade` no carrinho é em KG (ver UseCarrinho). */
  pesavel?: boolean
  quantidade: number
}

export interface FacetaTipo {
  tipo: string
  total: number
}

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome'

export const OPCOES_ORDENACAO: { valor: Ordenacao, label: string }[] = [
  { valor: 'relevancia', label: 'Mais relevantes' },
  { valor: 'menor-preco', label: 'Menor preço' },
  { valor: 'maior-preco', label: 'Maior preço' },
  { valor: 'nome', label: 'Nome (A-Z)' },
]

const POR_PAGINA = 40
const DEBOUNCE_MS = 400

/** Backoff progressivo enquanto o catálogo do servidor ainda está sendo montado. */
const INTERVALOS_POLL = [4000, 8000, 15_000, 30_000]
const MAX_POLLS = 10

export const IMAGEM_FALLBACK = '/sem-imagem.png'

// ═════════════ LINK DO PRODUTO ═════════════

/** "Arroz Tio João 5kg" → "arroz-tio-joao-5kg". Só pra URL ficar legível/indexável — quem manda é o id. */
export function slugProduto(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Endereço da página do produto: `/produto/<id>-<slug>`. */
export function linkProduto(produto: Pick<Produto, 'id' | 'nome'>): string {
  const slug = slugProduto(produto.nome)
  return `/produto/${produto.id}${slug ? `-${slug}` : ''}`
}

const ORDENACOES_VALIDAS = OPCOES_ORDENACAO.map(o => o.valor)

/** `route.query.x` pode vir string, lista ou vazio — aqui sempre string (e com teto de tamanho). */
function lerQuery(valor: unknown): string {
  const v = Array.isArray(valor) ? valor[0] : valor
  return typeof v === 'string' ? v.slice(0, 100) : ''
}

export function useCatalogo(endpoint: string) {
  const route = useRoute()
  const router = useRouter()
  const pathInicial = route.path

  // O estado da lista mora na URL (?pagina=&tipo=&ordenar=&q=). É o que faz o
  // "voltar" da página de um produto cair na mesma página/filtro/busca em que
  // a pessoa estava, em vez de voltar pra página 1 sem nada.
  const buscaInicial = lerQuery(route.query.q).trim()
  const ordenarInicial = lerQuery(route.query.ordenar) as Ordenacao
  const paginaInicial = Math.max(1, Number.parseInt(lerQuery(route.query.pagina)) || 1)

  const produtos = ref<Produto[]>([])
  const carregando = ref(true)
  const erro = ref(false)

  const paginaAtual = ref(paginaInicial)
  const totalPaginas = ref(1)
  const totalProdutos = ref(0)
  const cacheCompleto = ref(false)

  const busca = ref(buscaInicial)
  const buscaAtiva = ref(buscaInicial)

  // ═════════════ FILTROS ═════════════

  const tipoSelecionado = ref<string | null>(lerQuery(route.query.tipo) || null)
  const ordenacao = ref<Ordenacao>(ORDENACOES_VALIDAS.includes(ordenarInicial) ? ordenarInicial : 'relevancia')
  const tiposDisponiveis = ref<FacetaTipo[]>([])

  const filtrosAtivos = computed(() =>
    Boolean(busca.value) || tipoSelecionado.value !== null || ordenacao.value !== 'relevancia',
  )

  let timeoutBusca: ReturnType<typeof setTimeout> | null = null
  let timerPoll: ReturnType<typeof setTimeout> | null = null
  let controller: AbortController | null = null
  let pollsFeitos = 0
  /** Descarta respostas de requisições que já foram superadas por outra mais nova. */
  let sequencia = 0

  // ═════════════ BUSCA ═════════════

  async function requisitar(pagina: number, signal: AbortSignal) {
    return await $fetch<any>(endpoint, {
      query: {
        pagina,
        busca: buscaAtiva.value,
        tipo: tipoSelecionado.value ?? undefined,
        ordenar: ordenacao.value === 'relevancia' ? undefined : ordenacao.value,
      },
      signal,
    })
  }

  function aplicar(res: any) {
    produtos.value = res.produtos || []
    paginaAtual.value = res.pagina || 1
    totalPaginas.value = res.totalPaginas || 1
    totalProdutos.value = res.total || 0
    cacheCompleto.value = res.cacheCompleto ?? true
    tiposDisponiveis.value = res.tipos || []
  }

  /** Espelha página/filtros/busca na URL (sem empilhar histórico) — ver comentário no topo da função. */
  function sincronizarUrl() {
    // Se a pessoa já foi pra outra rota (ex.: abriu um produto) esta lista não manda mais na URL.
    if (route.path !== pathInicial)
      return

    const query: Record<string, string> = {}
    if (paginaAtual.value > 1)
      query.pagina = String(paginaAtual.value)
    if (tipoSelecionado.value)
      query.tipo = tipoSelecionado.value
    if (ordenacao.value !== 'relevancia')
      query.ordenar = ordenacao.value
    if (buscaAtiva.value)
      query.q = buscaAtiva.value

    router.replace({ query })
  }

  async function carregar(pagina = 1, rolarTopo = true) {
    // Cancela o que estiver em voo: trocar de página não deve empilhar requisições.
    controller?.abort()
    controller = new AbortController()

    const meu = ++sequencia
    carregando.value = true
    erro.value = false

    try {
      const res = await requisitar(pagina, controller.signal)
      if (meu !== sequencia)
        return // uma requisição mais nova já assumiu

      // Link antigo/compartilhado com página que não existe mais (ex.: ?pagina=99): cai na primeira.
      if (pagina > 1 && !res.produtos?.length && res.total > 0)
        return carregar(1, false)

      aplicar(res)
      sincronizarUrl()
      agendarPoll()

      if (rolarTopo && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    catch (e: any) {
      if (e?.name === 'AbortError' || meu !== sequencia)
        return
      console.error(e)
      erro.value = true
    }
    finally {
      if (meu === sequencia)
        carregando.value = false
    }
  }

  // ═════════════ POLLING ═════════════
  // Só existe para o caso raro de o servidor ainda estar montando o catálogo
  // (primeiro boot sem cache em disco). Desiste sozinho.

  function pararPoll() {
    if (timerPoll) {
      clearTimeout(timerPoll)
      timerPoll = null
    }
  }

  function agendarPoll() {
    pararPoll()

    if (cacheCompleto.value) {
      pollsFeitos = 0
      return
    }
    if (pollsFeitos >= MAX_POLLS)
      return

    const intervalo = INTERVALOS_POLL[Math.min(pollsFeitos, INTERVALOS_POLL.length - 1)]!
    timerPoll = setTimeout(executarPoll, intervalo)
  }

  async function executarPoll() {
    // Aba em segundo plano não precisa de atualização — reagenda e sai.
    if (typeof document !== 'undefined' && document.hidden) {
      agendarPoll()
      return
    }

    pollsFeitos++

    try {
      const res = await requisitar(paginaAtual.value, new AbortController().signal)
      const totalNovo = res.total || 0

      // Atualiza silenciosamente, sem piscar o grid.
      if (totalNovo > totalProdutos.value) {
        totalProdutos.value = totalNovo
        totalPaginas.value = res.totalPaginas || 1
        tiposDisponiveis.value = res.tipos || []
        if (res.produtos?.length > produtos.value.length) {
          produtos.value = res.produtos
        }
      }

      cacheCompleto.value = res.cacheCompleto ?? true
      agendarPoll()
    }
    catch {
      // Servidor com problema: para de insistir em vez de piorar a situação.
      pararPoll()
    }
  }

  // ═════════════ DEBOUNCE DA BUSCA ═════════════

  watch(busca, (valor) => {
    if (timeoutBusca)
      clearTimeout(timeoutBusca)
    timeoutBusca = setTimeout(() => {
      const nova = valor.trim()
      if (buscaAtiva.value === nova)
        return
      buscaAtiva.value = nova
      // O termo mudou: a subcategoria escolhida antes pode nem existir mais
      // no novo recorte, então volta ao "todas" em vez de zerar o resultado.
      tipoSelecionado.value = null
      pollsFeitos = 0
      carregar(1, false)
    }, DEBOUNCE_MS)
  })

  // ═════════════ FILTROS: AÇÕES ═════════════

  function selecionarTipo(tipo: string | null) {
    if (tipoSelecionado.value === tipo)
      return
    tipoSelecionado.value = tipo
    pollsFeitos = 0
    carregar(1, false)
  }

  function definirOrdenacao(valor: Ordenacao) {
    if (ordenacao.value === valor)
      return
    ordenacao.value = valor
    pollsFeitos = 0
    carregar(1, false)
  }

  function limparFiltros() {
    if (timeoutBusca)
      clearTimeout(timeoutBusca)
    busca.value = ''
    buscaAtiva.value = ''
    tipoSelecionado.value = null
    ordenacao.value = 'relevancia'
    pollsFeitos = 0
    carregar(1, false)
  }

  // ═════════════ PAGINAÇÃO ═════════════

  function irParaPagina(p: number) {
    if (p < 1 || p > totalPaginas.value || p === paginaAtual.value || carregando.value)
      return
    carregar(p)
  }

  const paginasVisiveis = computed<(number | '...')[]>(() => {
    const total = totalPaginas.value
    const atual = paginaAtual.value
    if (total <= 7)
      return Array.from({ length: total }, (_, i) => i + 1)

    const inicio = Math.max(2, atual - 2)
    const fim = Math.min(total - 1, atual + 2)
    const paginas: (number | '...')[] = [1]

    if (inicio > 2)
      paginas.push('...')
    for (let i = inicio; i <= fim; i++) paginas.push(i)
    if (fim < total - 1)
      paginas.push('...')
    paginas.push(total)

    return paginas
  })

  const intervaloExibido = computed(() => ({
    de: (paginaAtual.value - 1) * POR_PAGINA + 1,
    ate: Math.min(paginaAtual.value * POR_PAGINA, totalProdutos.value),
  }))

  // ═════════════ LIMPEZA ═════════════

  onUnmounted(() => {
    if (timeoutBusca)
      clearTimeout(timeoutBusca)
    pararPoll()
    controller?.abort()
  })

  return {
    produtos,
    carregando,
    erro,
    paginaAtual,
    totalPaginas,
    totalProdutos,
    cacheCompleto,
    busca,
    paginasVisiveis,
    intervaloExibido,
    carregar,
    irParaPagina,
    /** Página pedida na URL (?pagina=) — a primeira carga usa isto em vez de sempre 1. */
    paginaInicial,
    POR_PAGINA,

    // filtros
    tipoSelecionado,
    ordenacao,
    tiposDisponiveis,
    filtrosAtivos,
    selecionarTipo,
    definirOrdenacao,
    limparFiltros,
  }
}

// ═════════════ IMAGENS ═════════════

export function imgSrc(url: string | undefined | null) {
  return url?.trim() ? url : IMAGEM_FALLBACK
}

export function imagemErro(e: Event) {
  const img = e.target as HTMLImageElement
  if (!img.src.endsWith(IMAGEM_FALLBACK))
    img.src = IMAGEM_FALLBACK
}

// ═════════════ PROMOÇÃO ═════════════

/** Desconto em % pro badge (ex.: "-10%"). Arredonda pra baixo — nunca exagera o desconto. */
export function percentualDesconto(precoOriginal: string, preco2: string): number {
  const original = Number(precoOriginal)
  const atual = Number(preco2)
  if (!original || atual >= original)
    return 0
  return Math.floor((1 - atual / original) * 100)
}
