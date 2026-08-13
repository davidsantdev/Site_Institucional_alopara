/**
 * CATÁLOGO ÚNICO COMPARTILHADO
 * ============================
 *
 * Antes: cada rota (/api/alimentos, /api/bebidas, /api/limpeza, /api/higiene)
 * rastejava o catálogo INTEIRO da API da CISS por conta própria — mesmo endpoint,
 * até 500 páginas cada, token próprio, cache próprio, warmup próprio.
 * Resultado: 4× o catálogo completo baixado a cada ciclo (~2000 requisições),
 * com 80% dos dados descartados no filtro de departamento. A origem caía.
 *
 * Agora: UM crawler, UM token, UM cache. O catálogo é baixado uma única vez,
 * cada produto é classificado em suas categorias no momento da normalização,
 * e as rotas viram filtros em memória — ZERO requisições extras à origem.
 *
 * Redução de carga na origem: ~4× (uma varredura em vez de quatro)
 *                           × ~6× (TTL de 6h em vez de 55min)
 *                           ≈ 25× menos tráfego.
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

/** Log informativo do catálogo. Centralizado para não espalhar console.log. */
// eslint-disable-next-line no-console
const log = (msg: string) => console.log(msg)

// ═══════════════════════ TIPOS ═══════════════════════

export interface Produto {
  id: string
  nome: string
  preco2: string
  tipo: string
  img: string
  quantidade: number
  /** Bitmask das categorias às quais o produto pertence (ver CAT). */
  cat: number
  /**
   * true = imagem confirmada (veio de imageUrl/imagem da CISS, ou a URL
   * chutada por `montarImagem()` foi checada no CDN e existe de verdade).
   * A CISS nunca preenche imageUrl/imagem na prática — então isto depende
   * de `validarImagens()` ter rodado. Usado para ordenar em `consultar()`.
   */
  imagemReal: boolean
}

export interface Catalogo {
  produtos: Produto[]
  /** Momento da última varredura completa bem-sucedida (0 = nunca). */
  atualizadoEm: number
  /** false enquanto a varredura ainda está em andamento. */
  completo: boolean
  /**
   * Índice de busca em minúsculas, paralelo a `produtos`. Vive dentro do próprio
   * catálogo (e não em estado à parte) para nunca dessincronizar do array quando
   * uma varredura em segundo plano publica uma versão nova entre duas operações.
   * Não é persistido em disco — é reconstruído na leitura.
   */
  indice: string[]
}

/** Um produto pode pertencer a mais de uma categoria — daí o bitmask. */
export const CAT = {
  alimentos: 1 << 0,
  bebidas: 1 << 1,
  limpeza: 1 << 2,
  perfumaria: 1 << 3,
} as const

export type Categoria = keyof typeof CAT

// ═══════════════════════ CONFIGURAÇÃO ═══════════════════════

const BASE_URL = process.env.CISS_BASE_URL ?? 'https://aloparacim.dataciss.com.br'
const TOKEN_URL = `${BASE_URL}/cisspoder-auth/oauth/token`
const PRODUTOS_URL = `${BASE_URL}/cisspoder-service/get_produtos_sitemercado`
const ID_LOJA = process.env.CISS_ID_LOJA ?? '0001'

const CREDENCIAIS = {
  username: process.env.CISS_USER ?? '109',
  password: process.env.CISS_PASS ?? '123456',
  grant_type: 'password',
  client_secret: process.env.CISS_CLIENT_SECRET ?? 'poder7547',
  client_id: process.env.CISS_CLIENT_ID ?? 'cisspoder-oauth',
}

/** Validade do catálogo. Padrão 6h — era 55min × 4 rotas. */
const TTL_MS = Number(process.env.CATALOGO_TTL_MIN ?? 360) * 60_000
/** Margem de renovação do token antes de expirar de fato. */
const TOKEN_TTL_MS = 50 * 60_000

/** Páginas simultâneas. Baixo de propósito: a origem é frágil. */
const CONCORRENCIA = 2
const TIMEOUT_MS = 25_000
/**
 * A CISS nunca preenche imageUrl/imagem — toda foto é um CHUTE (montarImagem,
 * a partir do código de barras) que às vezes não existe no CDN. O CDN é um
 * blob storage (Azure), não a origem frágil, então aguenta bem mais concorrência.
 */
const CONCORRENCIA_IMAGENS = 60
const TIMEOUT_IMAGEM_MS = 6_000

/**
 * Cosmos (Bluesoft) — segunda fonte de imagem, só para o que sobra depois do
 * CDN da CISS. Sem token definido, o enriquecimento simplesmente não roda
 * (é opcional). O plano Basic dá só 25 consultas/dia — muito pouco perto dos
 * milhares de produtos sem imagem — então cada código de barras só é
 * consultado UMA vez na vida (resultado fica em .cache/cosmos.json para
 * sempre) e o orçamento diário sobrevive a restart do processo.
 */
const COSMOS_TOKEN = process.env.COSMOS_TOKEN ?? ''
const COSMOS_URL = 'https://cosmos.bluesoft.com.br/api/gtins'
const COSMOS_LIMITE_DIARIO = Number(process.env.COSMOS_LIMITE_DIARIO ?? 25)
const COSMOS_TIMEOUT_MS = 10_000
/** Sem pressa nenhuma com só 25/dia — dá pra ser educado com a API deles. */
const COSMOS_DELAY_MS = 1_500
/** 2 tentativas, não 3 — retry agressivo era parte do problema. */
const MAX_TENTATIVAS = 2
const DELAY_ENTRE_LOTES = 300
const MAX_PAGINAS = 600
/** Páginas vazias consecutivas até considerar o catálogo esgotado. */
const MAX_PAGINAS_VAZIAS = 4
/** Disjuntor: aborta a varredura em vez de martelar uma origem que já caiu. */
const MAX_FALHAS_SEGUIDAS = 8
/** Espera mínima entre tentativas de varredura depois de uma falha. */
const COOLDOWN_FALHA_MS = 2 * 60_000
/** Páginas buscadas de forma síncrona no primeiríssimo acesso (sem cache algum). */
const PAGINAS_INICIAIS = 4

const CACHE_DIR = join(process.cwd(), '.cache')
const CACHE_FILE = join(CACHE_DIR, 'catalogo.json')
const COSMOS_CACHE_FILE = join(CACHE_DIR, 'cosmos.json')

/**
 * `.data` é separado de `.cache` de propósito: tudo em `.cache` é regenerável
 * (a gente já mandou apagar `.cache/catalogo.json` várias vezes pra forçar uma
 * varredura nova). `.data` guarda escolha humana (foto que o admin escolheu) —
 * isso NUNCA pode ser apagado por engano do mesmo jeito.
 */
const DATA_DIR = join(process.cwd(), '.data')
const OVERRIDES_FILE = join(DATA_DIR, 'overrides.json')
export const UPLOADS_DIR = join(DATA_DIR, 'uploads')

const HEADERS_BASE = {
  'User-Agent': 'PostmanRuntime/7.54.0',
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
}

// ═══════════════════════ CLASSIFICAÇÃO ═══════════════════════
// Mantém exatamente as mesmas listas das rotas antigas, para que a composição
// de cada categoria continue idêntica — a mudança aqui é de carga, não de conteúdo.

const DEPS_ALIMENTOS = [
  'MERCEARIA',
  'BEBIDAS',
  'HORTIFRUTI',
  'PADARIA',
  'PAS',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',
  'ACOUGUE',
  'BOMBONIERE',
  'MATINAIS',
]

const DEPS_BEBIDAS = [
  'BEBIDAS',
  'SUCOS',
  'REFRIGERANTES',
  'CERVEJAS',
  'AGUAS',
  'DESTILADOS',
  'VINHOS',
  'ENERGETICOS',
]

const DEPS_LIMPEZA = [
  'LIMPEZA',
  'DESCARTAVEIS',
  'DESCARTÁVEL',
  'UTILIDADES',
  'CAMA MESA E BANHO',
  'LAVANDERIA',
  'LIMPEZA GERAL',
  'PRODUTOS DE LIMPEZA',
]

/** Perfumaria casa contra o texto completo do produto, não só o departamento. */
const TERMOS_PERFUMARIA = [
  'HIGIENE',
  'HIGIENE PESSOAL',
  'CABELOS',
  'CAPILAR',
  'PERFUMARIA',
  'COSMETICOS',
  'COSMÉTICOS',
  'BELEZA',
  'CUIDADOS PESSOAIS',
  'CUIDADO PESSOAL',
  'FRALDAS',
  'BEBE',
  'BEBÊ',
  'INFANTIL',
  'ABSORVENTE',
  'SABONETE',
  'SHAMPOO',
  'CONDICIONADOR',
  'CREME',
  'DESODORANTE',
  'DENTAL',
  'ORAL',
  'ESCOVA',
  'PASTA',
  'ENXAGUANTE',
  'PAPEL',
]

function classificar(bruto: any): number {
  const dep = String(bruto.departamento || '').toUpperCase()

  const blob = [
    bruto.departamento,
    bruto.categoria,
    bruto.subcategoria,
    bruto.nome,
    bruto.descricao,
  ].filter(Boolean).join(' ').toUpperCase()

  let cat = 0
  if (DEPS_ALIMENTOS.some(d => dep.includes(d)))
    cat |= CAT.alimentos
  if (DEPS_BEBIDAS.some(d => dep.includes(d)))
    cat |= CAT.bebidas
  if (DEPS_LIMPEZA.some(d => dep.includes(d)))
    cat |= CAT.limpeza
  if (TERMOS_PERFUMARIA.some(t => blob.includes(t)))
    cat |= CAT.perfumaria
  return cat
}

// ═══════════════════════ ESTADO (singleton à prova de HMR) ═══════════════════════
// Em dev o Nitro recarrega módulos; sem isto cada reload dispararia um crawler novo.

interface Estado {
  catalogo: Catalogo
  token: { valor: string, expiraEm: number } | null
  tokenEmVoo: Promise<string> | null
  varreduraEmVoo: Promise<void> | null
  bootEmVoo: Promise<void> | null
  /** Timestamp antes do qual nenhuma nova varredura é permitida (cooldown de falha). */
  proximaTentativa: number
}

const CHAVE = Symbol.for('alopara.catalogo.estado')
const g = globalThis as any

const estado: Estado = g[CHAVE] ??= {
  catalogo: { produtos: [], atualizadoEm: 0, completo: false, indice: [] },
  token: null,
  tokenEmVoo: null,
  varreduraEmVoo: null,
  bootEmVoo: null,
  proximaTentativa: 0,
}

/** Resultado de UM código de barras no Cosmos — guardado para sempre, nunca reconsultado. */
interface ResultadoCosmos {
  status: 'ok' | 'sem-foto' | 'nao-encontrado'
  thumbnail?: string
  checkedAt: number
}

interface EstadoCosmos {
  resultados: Record<string, ResultadoCosmos>
  orcamento: { dia: string, usados: number }
  carregado: boolean
}

const CHAVE_COSMOS = Symbol.for('alopara.catalogo.cosmos')
const estadoCosmos: EstadoCosmos = g[CHAVE_COSMOS] ??= {
  resultados: {},
  orcamento: { dia: '', usados: 0 },
  carregado: false,
}

/** Foto escolhida à mão pelo admin — vale para sempre, até alguém trocar de novo. */
interface Override {
  imagem: string
  atualizadoEm: number
}

interface EstadoOverrides {
  /** Chave: Produto.id (mesmo identificador usado pra deduplicar na varredura). */
  dados: Record<string, Override>
  carregado: boolean
}

const CHAVE_OVERRIDES = Symbol.for('alopara.catalogo.overrides')
const estadoOverrides: EstadoOverrides = g[CHAVE_OVERRIDES] ??= {
  dados: {},
  carregado: false,
}

async function carregarOverrides(): Promise<void> {
  if (estadoOverrides.carregado)
    return
  estadoOverrides.carregado = true
  try {
    if (!existsSync(OVERRIDES_FILE))
      return
    const dados = JSON.parse(await readFile(OVERRIDES_FILE, 'utf-8'))
    if (dados && typeof dados === 'object')
      estadoOverrides.dados = dados
  }
  catch {
    // Arquivo ausente ou corrompido: segue com zero overrides em vez de travar o site.
  }
}

async function salvarOverridesDisco(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${OVERRIDES_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(estadoOverrides.dados), 'utf-8')
  await rename(tmp, OVERRIDES_FILE)
}

/**
 * Define a foto de um produto escolhida à mão pelo admin — ou remove (imagem
 * vazia), voltando a valer o que a automação (CDN/Cosmos) decidir sozinha.
 * Aplica no catálogo já publicado NA HORA (não espera a próxima varredura de
 * 6h) e persiste em disco pra sobreviver a qualquer varredura futura.
 */
export async function definirOverrideImagem(produtoId: string, imagem: string): Promise<void> {
  await carregarOverrides()

  if (imagem)
    estadoOverrides.dados[produtoId] = { imagem, atualizadoEm: Date.now() }
  else
    delete estadoOverrides.dados[produtoId]

  await salvarOverridesDisco()

  const produto = estado.catalogo.produtos.find(p => p.id === produtoId)
  if (produto) {
    if (imagem) {
      produto.img = imagem
      produto.imagemReal = true
    }
    else {
      // Removendo o override: o arquivo enviado já foi apagado do disco (ver
      // rota de DELETE), então manter a URL antiga aqui mostraria imagem
      // quebrada. Cai pro "sem imagem" até a próxima varredura re-descobrir
      // a foto automática (não vale reprocessar CDN/Cosmos só por causa disto).
      produto.img = ''
      produto.imagemReal = false
    }
  }
}

function aplicarOverrides(produtos: Produto[]): void {
  if (Object.keys(estadoOverrides.dados).length === 0)
    return
  for (const p of produtos) {
    const ov = estadoOverrides.dados[p.id]
    if (ov) {
      p.img = ov.imagem
      p.imagemReal = true
    }
  }
}

/**
 * Produto removido do site pelo admin — some das rotas públicas, mas
 * continua existindo (a CISS é quem manda de verdade; isto não apaga nada
 * de lá, só esconde na vitrine). `consultar()` filtra por isto; o admin
 * pesquisa com `incluirOcultos: true` pra conseguir restaurar depois.
 */
const OCULTOS_FILE = join(DATA_DIR, 'ocultos.json')

interface EstadoOcultos {
  /** Chave: Produto.id. Valor: quando foi ocultado (só pra referência). */
  dados: Record<string, number>
  carregado: boolean
}

const CHAVE_OCULTOS = Symbol.for('alopara.catalogo.ocultos')
const estadoOcultos: EstadoOcultos = g[CHAVE_OCULTOS] ??= {
  dados: {},
  carregado: false,
}

async function carregarOcultos(): Promise<void> {
  if (estadoOcultos.carregado)
    return
  estadoOcultos.carregado = true
  try {
    if (!existsSync(OCULTOS_FILE))
      return
    const dados = JSON.parse(await readFile(OCULTOS_FILE, 'utf-8'))
    if (dados && typeof dados === 'object')
      estadoOcultos.dados = dados
  }
  catch {
    // Arquivo ausente ou corrompido: segue com zero ocultos em vez de travar o site.
  }
}

async function salvarOcultosDisco(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${OCULTOS_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(estadoOcultos.dados), 'utf-8')
  await rename(tmp, OCULTOS_FILE)
}

/** Oculta (ou restaura) um produto do site. Some/reaparece na hora, sem esperar varredura. */
export async function ocultarProduto(produtoId: string, oculto: boolean): Promise<void> {
  await carregarOcultos()

  if (oculto)
    estadoOcultos.dados[produtoId] = Date.now()
  else
    delete estadoOcultos.dados[produtoId]

  await salvarOcultosDisco()
}

export function produtoEstaOculto(produtoId: string): boolean {
  return produtoId in estadoOcultos.dados
}

async function publicar(produtos: Produto[], atualizadoEm: number, completo: boolean) {
  // Roda antes de qualquer varredura terminar: garante que a foto escolhida
  // pelo admin nunca é perdida quando o catálogo é reconstruído do zero.
  await carregarOverrides()
  aplicarOverrides(produtos)
  // Só carrega — a filtragem em si acontece em consultar(), não aqui, porque
  // o admin precisa continuar enxergando (e restaurando) produto oculto.
  await carregarOcultos()

  // Substituição atômica: produtos e índice trocam juntos, sempre coerentes.
  estado.catalogo = {
    produtos,
    atualizadoEm,
    completo,
    indice: produtos.map(p => `${p.nome} ${p.tipo}`.toLowerCase()),
  }
}

// ═══════════════════════ DISCO ═══════════════════════

/** Forma persistida — sem o índice, que é derivado e reconstruído na leitura. */
type CatalogoDisco = Omit<Catalogo, 'indice'>

async function lerDisco(): Promise<CatalogoDisco | null> {
  try {
    if (!existsSync(CACHE_FILE))
      return null
    const dados = JSON.parse(await readFile(CACHE_FILE, 'utf-8')) as CatalogoDisco
    if (!Array.isArray(dados?.produtos) || dados.produtos.length === 0)
      return null
    return dados
  }
  catch {
    return null
  }
}

async function salvarDisco(catalogo: CatalogoDisco): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true })
    // Escrita atômica: um crash no meio do write não corrompe o cache.
    const tmp = `${CACHE_FILE}.tmp`
    await writeFile(tmp, JSON.stringify(catalogo), 'utf-8')
    await rename(tmp, CACHE_FILE)
    log(`[catálogo] 💾 salvo: ${catalogo.produtos.length} produtos`)
  }
  catch (err) {
    console.error('[catálogo] erro ao salvar em disco:', err)
  }
}

/** Carrega uma vez por processo — chamadas seguintes são no-op (evita reler o arquivo a cada varredura). */
async function lerCosmosDisco(): Promise<void> {
  if (estadoCosmos.carregado)
    return
  estadoCosmos.carregado = true
  try {
    if (!existsSync(COSMOS_CACHE_FILE))
      return
    const dados = JSON.parse(await readFile(COSMOS_CACHE_FILE, 'utf-8'))
    if (dados?.resultados)
      estadoCosmos.resultados = dados.resultados
    if (dados?.orcamento)
      estadoCosmos.orcamento = dados.orcamento
  }
  catch {
    // Cache ausente ou corrompido: segue com estado vazio — o pior caso é
    // reconsultar códigos já vistos, não travar a varredura.
  }
}

async function salvarCosmosDisco(): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true })
    const tmp = `${COSMOS_CACHE_FILE}.tmp`
    await writeFile(tmp, JSON.stringify({ resultados: estadoCosmos.resultados, orcamento: estadoCosmos.orcamento }), 'utf-8')
    await rename(tmp, COSMOS_CACHE_FILE)
  }
  catch (err) {
    console.error('[cosmos] erro ao salvar cache em disco:', err)
  }
}

// ═══════════════════════ TOKEN (single-flight) ═══════════════════════

async function getToken(): Promise<string> {
  if (estado.token && Date.now() < estado.token.expiraEm)
    return estado.token.valor
  // Se 20 requisições chegarem juntas com o token vencido, só UMA vai buscar.
  if (estado.tokenEmVoo)
    return estado.tokenEmVoo

  estado.tokenEmVoo = (async () => {
    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': HEADERS_BASE['User-Agent'],
        },
        body: new URLSearchParams(CREDENCIAIS),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      const dados = JSON.parse(await res.text())
      if (!dados?.access_token)
        throw new Error(`token inválido: ${JSON.stringify(dados)}`)

      estado.token = { valor: dados.access_token, expiraEm: Date.now() + TOKEN_TTL_MS }
      return dados.access_token as string
    }
    finally {
      estado.tokenEmVoo = null
    }
  })()

  return estado.tokenEmVoo
}

// ═══════════════════════ HELPERS ═══════════════════════

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function montarImagem(codigo: string | number | null | undefined): string {
  if (!codigo)
    return ''
  const cod = String(codigo).trim()
  if (!cod || cod === '0')
    return ''
  return `https://cdn.cisslive.com.br/images/${cod}_1.jpg`
}

async function imagemExiste(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(TIMEOUT_IMAGEM_MS),
    })
    return res.ok
  }
  catch {
    return false
  }
}

/**
 * Confere no CDN, com um teto de concorrência, quais imagens chutadas por
 * `montarImagem()` realmente existem. Sem isto `imagemReal` fica sempre falso
 * (a API nunca manda imageUrl/imagem) e a ordenação "imagem primeiro" não tem
 * efeito nenhum — só reordena produtos que já não têm imagem.
 */
async function validarImagens(produtos: Produto[]): Promise<void> {
  const pendentes = produtos.filter(p => p.img && !p.imagemReal)
  if (pendentes.length === 0)
    return

  log(`[catálogo] 🖼️ validando ${pendentes.length} imagens no CDN...`)

  let indice = 0
  async function trabalhador() {
    while (indice < pendentes.length) {
      const p = pendentes[indice++]!
      p.imagemReal = await imagemExiste(p.img)
    }
  }
  await Promise.all(Array.from({ length: CONCORRENCIA_IMAGENS }, trabalhador))

  const validas = pendentes.filter(p => p.imagemReal).length
  log(`[catálogo] 🖼️ ${validas}/${pendentes.length} imagens confirmadas no CDN`)
}

/** Extrai o código de barras da URL chutada por `montarImagem()` — é a única fonte que temos dele aqui. */
function extrairCodigoDaImagem(img: string): string | null {
  const m = img.match(/\/images\/(\d+)_1\.jpg$/)
  return m?.[1] ?? null
}

/** Uma consulta ao Cosmos. `'limite'` = bateu 429 (para tudo por hoje). `'erro'` = falha pontual (não conta orçamento, tenta de novo depois). */
async function buscarCosmos(gtin: string): Promise<ResultadoCosmos | 'limite' | 'erro'> {
  try {
    const res = await fetch(`${COSMOS_URL}/${gtin}.json`, {
      headers: {
        'X-Cosmos-Token': COSMOS_TOKEN,
        'User-Agent': 'Cosmos-API-Request',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(COSMOS_TIMEOUT_MS),
    })

    if (res.status === 429)
      return 'limite'
    if (!res.ok)
      return { status: 'nao-encontrado', checkedAt: Date.now() }

    const json: any = await res.json()
    return json.thumbnail
      ? { status: 'ok', thumbnail: json.thumbnail, checkedAt: Date.now() }
      : { status: 'sem-foto', checkedAt: Date.now() }
  }
  catch {
    return 'erro'
  }
}

/**
 * Segunda fonte de imagem — só entra pros produtos que sobraram sem imagem
 * depois do CDN da CISS. Com só 25 consultas/dia (plano Basic), o desenho é:
 *
 *  1) Reaplica de graça (sem gastar orçamento) qualquer imagem já descoberta
 *     num ciclo anterior — o resultado de cada código de barras é permanente.
 *  2) Gasta o orçamento do dia só em código NUNCA consultado antes.
 *
 * Em ~8 mil produtos sem imagem, isso enriquece aos poucos ao longo de meses,
 * não de uma vez — é o preço do plano gratuito/básico, não um bug.
 */
async function enriquecerComCosmos(produtos: Produto[]): Promise<void> {
  if (!COSMOS_TOKEN)
    return

  await lerCosmosDisco()

  const hoje = new Date().toISOString().slice(0, 10)
  if (estadoCosmos.orcamento.dia !== hoje)
    estadoCosmos.orcamento = { dia: hoje, usados: 0 }

  const semImagem = produtos.filter(p => p.img && !p.imagemReal)

  // 1) Reaproveita o que já foi descoberto antes — não custa nada.
  let doCache = 0
  for (const p of semImagem) {
    const codigo = extrairCodigoDaImagem(p.img)
    const resultado = codigo ? estadoCosmos.resultados[codigo] : undefined
    if (resultado?.status === 'ok' && resultado.thumbnail) {
      p.img = resultado.thumbnail
      p.imagemReal = true
      doCache++
    }
  }
  if (doCache > 0)
    log(`[cosmos] 🖼️ ${doCache} produto(s) reaproveitado(s) do cache (sem gastar orçamento)`)

  // 2) Só o que nunca foi consultado, até o orçamento do dia acabar.
  const restante = COSMOS_LIMITE_DIARIO - estadoCosmos.orcamento.usados
  if (restante <= 0)
    return

  const pendentes: { produto: Produto, codigo: string }[] = []
  for (const p of semImagem) {
    if (p.imagemReal || pendentes.length >= restante)
      continue
    const codigo = extrairCodigoDaImagem(p.img)
    if (!codigo || estadoCosmos.resultados[codigo])
      continue
    pendentes.push({ produto: p, codigo })
  }
  if (pendentes.length === 0)
    return

  log(`[cosmos] 🔎 consultando ${pendentes.length} produto(s) novo(s) (orçamento: ${restante}/${COSMOS_LIMITE_DIARIO})`)

  let novos = 0
  for (const { produto, codigo } of pendentes) {
    const r = await buscarCosmos(codigo)

    if (r === 'limite') {
      log('[cosmos] ⛔ limite diário atingido na origem — parando por hoje')
      estadoCosmos.orcamento.usados = COSMOS_LIMITE_DIARIO
      break
    }
    if (r === 'erro')
      continue // falha pontual: não consome orçamento, tenta de novo no próximo ciclo

    estadoCosmos.resultados[codigo] = r
    estadoCosmos.orcamento.usados++

    if (r.status === 'ok' && r.thumbnail) {
      produto.img = r.thumbnail
      produto.imagemReal = true
      novos++
    }

    await sleep(COSMOS_DELAY_MS)
  }

  log(`[cosmos] ✅ ${novos} imagem(ns) nova(s) encontrada(s) hoje`)
  await salvarCosmosDisco()
}

/** Resultado de uma página: `null` distingue falha de página legitimamente vazia. */
async function buscarPagina(pagina: number, headers: Record<string, string>): Promise<any[] | null> {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const res = await fetch(PRODUTOS_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ idLoja: ID_LOJA, page: pagina }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!res.ok)
        throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      return Array.isArray(json) ? json : (json?.data ?? [])
    }
    catch (err: any) {
      if (tentativa < MAX_TENTATIVAS) {
        // Backoff com jitter para não sincronizar as retentativas em um pulso só.
        await sleep(1200 + Math.floor(Math.random() * 600))
      }
      else {
        console.warn(`[catálogo] pág ${pagina} falhou: ${err?.message ?? err}`)
        return null
      }
    }
  }
  return null
}

function normalizar(brutos: any[], vistos: Set<string>, destino: Produto[]): number {
  let novos = 0

  for (const p of brutos) {
    if (p.ativo !== 'S')
      continue

    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0)
      continue

    const cat = classificar(p)
    // Produto que não cai em nenhuma categoria não é armazenado — economiza memória e disco.
    if (cat === 0)
      continue

    const id = String(p.plu || p.codigoBarra || p.id || '')
    if (!id || vistos.has(id))
      continue
    vistos.add(id)

    const imagemApi = p.imageUrl?.trim() || p.imagem?.trim() || ''

    destino.push({
      id,
      nome: p.nome?.trim() || 'Produto sem nome',
      preco2: preco.toFixed(2),
      tipo:
        p.subcategoria?.replace(/^\d+\s/, '')?.trim()
        || p.categoria?.trim()
        || p.departamento?.trim()
        || 'Geral',
      img: imagemApi || montarImagem(p.nrcodbarprod || p.codigoBarra),
      imagemReal: Boolean(imagemApi),
      quantidade: 1,
      cat,
    })
    novos++
  }

  return novos
}

// ═══════════════════════ VARREDURA ═══════════════════════

/**
 * Varre o catálogo inteiro uma única vez.
 * Publica resultados parciais conforme avança, para que as rotas já respondam
 * com dados enquanto o resto carrega.
 */
async function varrer(): Promise<void> {
  const token = await getToken()
  const headers = {
    ...HEADERS_BASE,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  // Snapshot do que já servimos. Se esta é uma revalidação de um catálogo bom,
  // NÃO publicamos parciais — senão o site encolheria no meio da atualização.
  const anterior = estado.catalogo
  const revalidando = anterior.completo && anterior.produtos.length > 0

  const vistos = new Set<string>()
  const produtos: Produto[] = []

  let pagina = 1
  let vazias = 0
  let falhasSeguidas = 0
  let abortada = false

  log('[catálogo] 🚀 iniciando varredura única...')

  while (pagina <= MAX_PAGINAS) {
    const lote = Array.from({ length: CONCORRENCIA }, (_, i) => buscarPagina(pagina + i, headers))
    const resultados = await Promise.all(lote)

    let novosNoLote = 0

    for (const dados of resultados) {
      if (dados === null) {
        // Falha de rede/timeout — alimenta o disjuntor.
        falhasSeguidas++
        continue
      }

      falhasSeguidas = 0

      if (dados.length === 0) {
        vazias++
      }
      else {
        vazias = 0
        novosNoLote += normalizar(dados, vistos, produtos)
      }
    }

    // Disjuntor: a origem está fora do ar. Para de martelar e mantém o que já temos.
    if (falhasSeguidas >= MAX_FALHAS_SEGUIDAS) {
      console.error(`[catálogo] ⛔ varredura abortada após ${falhasSeguidas} falhas seguidas — origem instável`)
      abortada = true
      break
    }

    // Publica parcial só na construção inicial — assim a página já mostra produtos
    // enquanto carrega, sem nunca regredir um catálogo que já está completo.
    if (novosNoLote > 0 && !revalidando) {
      await publicar([...produtos], 0, false)
    }

    if (vazias >= MAX_PAGINAS_VAZIAS) {
      log('[catálogo] 🏁 fim do catálogo')
      break
    }

    pagina += CONCORRENCIA
    await sleep(DELAY_ENTRE_LOTES)
  }

  if (abortada && produtos.length < anterior.produtos.length) {
    // Varredura incompleta trouxe menos do que já tínhamos: mantém o cache antigo
    // e tenta de novo no próximo TTL, em vez de degradar o site.
    console.warn('[catálogo] mantendo cache anterior (varredura parcial trouxe menos produtos)')
    if (revalidando)
      await publicar(anterior.produtos, anterior.atualizadoEm, true)
    return
  }

  if (abortada) {
    // Varredura parcial: serve o que deu, mas NÃO carimba como fresca — senão o
    // catálogo quebrado ficaria congelado pelo TTL inteiro (6h). O cooldown de
    // getCatalogo() é quem controla o ritmo das novas tentativas.
    await publicar(produtos, 0, false)
    console.warn(`[catálogo] ⚠️ varredura parcial: ${produtos.length} produtos`)
    return
  }

  // Roda depois da varredura completa (não bloqueia a resposta a ninguém —
  // quem já está sendo servido continua vendo o catálogo anterior até aqui).
  await validarImagens(produtos)
  // Segunda fonte de imagem, só pro que sobrou sem foto — ver enriquecerComCosmos().
  await enriquecerComCosmos(produtos)

  const agora = Date.now()
  await publicar(produtos, agora, true)
  estado.proximaTentativa = 0
  log(`[catálogo] ✅ ${produtos.length} produtos`)

  await salvarDisco({ produtos, atualizadoEm: agora, completo: true })
}

/** Garante que só existe UMA varredura em voo, por mais chamadas que cheguem. */
function varrerUmaVez(): Promise<void> {
  if (estado.varreduraEmVoo)
    return estado.varreduraEmVoo

  estado.varreduraEmVoo = varrer()
    .catch(err => console.error('[catálogo] erro na varredura:', err))
    .finally(() => { estado.varreduraEmVoo = null })

  return estado.varreduraEmVoo
}

// ═══════════════════════ PRIMEIRO ACESSO ═══════════════════════

/** Busca poucas páginas de forma síncrona para o primeiro acesso não ver tela vazia. */
async function primeiroLote(): Promise<void> {
  try {
    const token = await getToken()
    const headers = {
      ...HEADERS_BASE,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    const resultados = await Promise.all(
      Array.from({ length: PAGINAS_INICIAIS }, (_, i) => buscarPagina(i + 1, headers)),
    )

    const vistos = new Set<string>()
    const produtos: Produto[] = []
    for (const dados of resultados) {
      if (dados?.length)
        normalizar(dados, vistos, produtos)
    }

    if (produtos.length)
      await publicar(produtos, 0, false)
  }
  catch (err) {
    console.error('[catálogo] erro no lote inicial:', err)
  }
}

// ═══════════════════════ API PÚBLICA ═══════════════════════

/**
 * Devolve o catálogo. Nunca lança e nunca bloqueia por uma varredura completa:
 * serve o que tem na hora e atualiza em segundo plano (stale-while-revalidate).
 */
export async function getCatalogo(): Promise<Catalogo> {
  // 1. Boot: carrega o disco para a memória uma única vez.
  //    Single-flight — várias requisições simultâneas no boot esperam a mesma leitura,
  //    em vez de cada uma concluir "não tem nada" e disparar sua própria varredura.
  estado.bootEmVoo ??= (async () => {
    const disco = await lerDisco()
    if (disco) {
      await publicar(disco.produtos, disco.atualizadoEm, disco.completo)
      const idade = Math.round((Date.now() - disco.atualizadoEm) / 60_000)
      log(`[catálogo] ⚡ ${disco.produtos.length} produtos do disco (${idade}min atrás)`)
    }
  })()
  await estado.bootEmVoo

  const agora = Date.now()
  const { produtos, atualizadoEm } = estado.catalogo
  const vencido = agora - atualizadoEm > TTL_MS

  // Cooldown: sem isto, uma origem fora do ar faria CADA requisição disparar uma
  // nova tentativa de varredura — exatamente o martelamento que derrubava a API.
  const podeTentar = agora >= estado.proximaTentativa && !estado.varreduraEmVoo

  // 2. Nada em memória: precisa de dados agora.
  if (produtos.length === 0) {
    if (podeTentar) {
      estado.proximaTentativa = agora + COOLDOWN_FALHA_MS
      await primeiroLote() // resposta rápida com as primeiras páginas
      varrerUmaVez() // resto em segundo plano
    }
    return estado.catalogo
  }

  // 3. Tem dados mas venceram: serve o que tem e revalida em segundo plano.
  if (vencido && podeTentar) {
    estado.proximaTentativa = agora + COOLDOWN_FALHA_MS
    varrerUmaVez()
  }

  return estado.catalogo
}

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome'

/** Subcategoria (`tipo`) disponível dentro do recorte atual, com contagem. */
export interface FacetaTipo {
  tipo: string
  total: number
}

export interface Resultado {
  produtos: Produto[]
  pagina: number
  total: number
  totalPaginas: number
  temMais: boolean
  cacheCompleto: boolean
  /** Subcategorias presentes no recorte categoria+busca, ordenadas por frequência. */
  tipos: FacetaTipo[]
}

/** Máximo de chips de subcategoria expostos ao front — o resto fica agrupado. */
const MAX_FACETAS = 20

/**
 * Filtra o catálogo por categoria + busca + subcategoria, ordena e pagina.
 * Roda 100% em memória — nenhuma requisição à origem.
 */
export function consultar(
  catalogo: Catalogo,
  categoria: Categoria | Categoria[] | null,
  busca: string,
  pagina: number,
  porPagina: number,
  opcoes: { tipo?: string, ordenar?: Ordenacao, incluirOcultos?: boolean } = {},
): Resultado {
  // `null` = catálogo inteiro; array = união de categorias.
  const mascara = categoria === null
    ? 0
    : (Array.isArray(categoria) ? categoria : [categoria])
        .reduce((acc, c) => acc | CAT[c], 0)
  const termo = busca.toLowerCase().trim()
  // produtos e indice vêm do MESMO objeto: não há como estarem desalinhados,
  // mesmo se uma varredura em segundo plano publicar uma versão nova agora.
  const { produtos, indice } = catalogo

  // 1ª passada: categoria + busca. Este é o recorte usado para calcular as
  // facetas de subcategoria — assim os chips mostram contagens de "o que eu
  // veria se limpasse o filtro de subcategoria agora", não o total já filtrado.
  const base: Produto[] = []
  const contagemTipos = new Map<string, number>()
  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i]!
    if (mascara && !(p.cat & mascara))
      continue
    // Índice pré-computado: evita um toLowerCase() por item, por requisição.
    if (termo && !indice[i]!.includes(termo))
      continue
    // Produto removido pelo admin: só o próprio painel enxerga (pra poder restaurar).
    if (!opcoes.incluirOcultos && produtoEstaOculto(p.id))
      continue
    base.push(p)
    contagemTipos.set(p.tipo, (contagemTipos.get(p.tipo) ?? 0) + 1)
  }

  const tipos = [...contagemTipos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_FACETAS)
    .map(([tipo, total]) => ({ tipo, total }))

  // 2ª passada: filtro de subcategoria, se pedido.
  const filtrados = opcoes.tipo ? base.filter(p => p.tipo === opcoes.tipo) : base

  // Ordenação. 'relevancia' mantém a ordem natural (a da origem) — sem custo extra.
  if (opcoes.ordenar === 'menor-preco') {
    filtrados.sort((a, b) => Number(a.preco2) - Number(b.preco2))
  }
  else if (opcoes.ordenar === 'maior-preco') {
    filtrados.sort((a, b) => Number(b.preco2) - Number(a.preco2))
  }
  else if (opcoes.ordenar === 'nome') {
    filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }

  // Produtos com imagem de verdade da CISS vêm primeiro; o resto (URL
  // adivinhada por montarImagem() ou nenhuma) cai para o fim, mas continua
  // aparecendo — nunca é descartado. Array.sort é estável, então isto só
  // separa em dois blocos sem embaralhar a ordenação já aplicada acima.
  filtrados.sort((a, b) => (a.imagemReal ? 0 : 1) - (b.imagemReal ? 0 : 1))

  const paginaSegura = Math.max(1, pagina)
  const inicio = (paginaSegura - 1) * porPagina

  return {
    produtos: filtrados.slice(inicio, inicio + porPagina),
    pagina: paginaSegura,
    total: filtrados.length,
    totalPaginas: Math.max(1, Math.ceil(filtrados.length / porPagina)),
    temMais: inicio + porPagina < filtrados.length,
    cacheCompleto: catalogo.completo,
    tipos,
  }
}
