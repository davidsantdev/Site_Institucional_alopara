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
import { buscarOfertasMercafacil } from './mercafacil'

/** Log informativo do catálogo. Centralizado para não espalhar console.log. */
// eslint-disable-next-line no-console
const log = (msg: string) => console.log(msg)

// ═══════════════════════ TIPOS ═══════════════════════

export interface Produto {
  id: string
  nome: string
  /** Preço de venda de verdade — já é o promocional quando `emPromocao` é true. */
  preco2: string
  /**
   * Preço "de", pra riscar na tela. Igual a `preco2` quando não há promoção
   * (assim o front nunca precisa tratar campo ausente).
   */
  precoOriginal: string
  /** true quando a CISS manda `vlrPromocao` válido (>0 e menor que o preço normal). */
  emPromocao: boolean
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
  /**
   * true = saldo de estoque na CISS é ≤0 OU o campo nem veio (ver `normalizar()`).
   * `consultar()` filtra por isto nas rotas públicas — o admin vê/busca mesmo assim.
   */
  semEstoque: boolean
  /** Código de barras (EAN/GTIN) — usado pra cruzar com as ofertas da Mercafácil. */
  ean: string
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
/**
 * Teto de páginas e paciência com página vazia — sobem sem tocar em
 * concorrência/timeout/delay (é isso que mantém a origem frágil respirando).
 * Antes (4 vazias seguidas / 600 páginas) parava bem antes do catálogo
 * realmente acabar sempre que a CISS devolvia um vazio "no meio do caminho"
 * em vez de só no fim de verdade — aumentar isto é puro ganho de cobertura
 * dentro das MESMAS categorias, não muda o que conta como Alimentos/Bebidas/
 * Limpeza/Perfumaria.
 */
const MAX_PAGINAS = 1500
/** Páginas vazias consecutivas até considerar o catálogo esgotado. */
const MAX_PAGINAS_VAZIAS = 15
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
const ESTOQUE_OVERRIDES_FILE = join(DATA_DIR, 'estoque-overrides.json')
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

  'PADARIA',

  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',

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
  /** Timestamp antes do qual "Atualizar agora" (admin) não dispara outra varredura. */
  proximoForcar: number
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
  proximoForcar: 0,
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
 * Correção manual de estoque — pra quando a CISS erra (ex.: "arroz" sem o
 * campo `qtdEstoqueAtual` preenchido mas com estoque de verdade na loja, ou
 * o contrário). `true` = força "tem estoque", `false` = força "sem estoque".
 * Ausente = automático, vale o que `normalizar()` calculou da CISS.
 */
interface EstadoEstoqueOverrides {
  /** Chave: Produto.id. */
  dados: Record<string, boolean>
  carregado: boolean
}

const CHAVE_ESTOQUE_OVERRIDES = Symbol.for('alopara.catalogo.estoqueOverrides')
const estadoEstoqueOverrides: EstadoEstoqueOverrides = g[CHAVE_ESTOQUE_OVERRIDES] ??= {
  dados: {},
  carregado: false,
}

async function carregarEstoqueOverrides(): Promise<void> {
  if (estadoEstoqueOverrides.carregado)
    return
  estadoEstoqueOverrides.carregado = true
  try {
    if (!existsSync(ESTOQUE_OVERRIDES_FILE))
      return
    const dados = JSON.parse(await readFile(ESTOQUE_OVERRIDES_FILE, 'utf-8'))
    if (dados && typeof dados === 'object')
      estadoEstoqueOverrides.dados = dados
  }
  catch {
    // Arquivo ausente ou corrompido: segue com zero correções em vez de travar o site.
  }
}

async function salvarEstoqueOverridesDisco(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${ESTOQUE_OVERRIDES_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(estadoEstoqueOverrides.dados), 'utf-8')
  await rename(tmp, ESTOQUE_OVERRIDES_FILE)
}

/**
 * Corrige (ou remove a correção de) o estoque de um produto na mão. Aplica no
 * catálogo já publicado NA HORA e persiste em disco pra sobreviver a
 * qualquer varredura futura — `publicar()` reaplica a cada catálogo novo.
 * `disponivel: null` remove a correção, voltando a valer o que a CISS disser
 * sozinha (só na próxima varredura — o valor atual não é recalculado aqui).
 */
export async function definirOverrideEstoque(produtoId: string, disponivel: boolean | null): Promise<void> {
  await carregarEstoqueOverrides()

  if (disponivel === null)
    delete estadoEstoqueOverrides.dados[produtoId]
  else
    estadoEstoqueOverrides.dados[produtoId] = disponivel

  await salvarEstoqueOverridesDisco()

  const produto = estado.catalogo.produtos.find(p => p.id === produtoId)
  if (produto && disponivel !== null)
    produto.semEstoque = !disponivel
}

export function produtoTemOverrideEstoque(produtoId: string): boolean {
  return produtoId in estadoEstoqueOverrides.dados
}

function aplicarOverridesEstoque(produtos: Produto[]): void {
  if (Object.keys(estadoEstoqueOverrides.dados).length === 0)
    return
  for (const p of produtos) {
    const disponivel = estadoEstoqueOverrides.dados[p.id]
    if (disponivel !== undefined)
      p.semEstoque = !disponivel
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
  // Mesma lógica pra correção manual de estoque — nunca se perde quando a
  // varredura de 6h reconstrói o catálogo do zero com os dados novos da CISS.
  await carregarEstoqueOverrides()
  aplicarOverridesEstoque(produtos)
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

/**
 * Sobe SEMPRE que um campo é adicionado/removido de `Produto` (ex.: `semEstoque`,
 * `emPromocao`). O cache em disco é lido direto pra memória SEM passar por
 * `normalizar()` de novo — então um cache salvo pela versão anterior do código
 * fica com os produtos faltando o campo novo (`undefined`, sempre falsy) até a
 * próxima varredura completa, até 6h depois. Já aconteceu na prática: produtos
 * em promoção sumiam do site porque o cache antigo não tinha `emPromocao`.
 * Subir este número força uma varredura nova no próximo boot, sem precisar
 * lembrar de apagar `.cache/catalogo.json` manualmente a cada deploy.
 */
const CACHE_VERSAO = 3

/**
 * `versaoAtual: false` = o formato mudou desde que isto foi salvo (campo novo
 * em `Produto` que este arquivo não tem). Mesmo assim devolve os produtos —
 * publicá-los AGORA (com o campo novo undefined) e marcar como vencido pra
 * revalidar em seguida é bem mais seguro do que tratar como "sem cache
 * nenhum": aquele caminho não tem um `anterior.produtos` pra proteger o site
 * se a origem estiver fora do ar bem nesse momento (foi o que aconteceu: o
 * bump de versão coincidiu com a CISS rejeitando o token, e o site ficou sem
 * NADA pra servir até o token se recuperar sozinho).
 */
async function lerDisco(): Promise<{ dados: CatalogoDisco, versaoAtual: boolean } | null> {
  try {
    if (!existsSync(CACHE_FILE))
      return null
    const dados = JSON.parse(await readFile(CACHE_FILE, 'utf-8'))
    if (!Array.isArray(dados?.produtos) || dados.produtos.length === 0)
      return null
    return { dados: dados as CatalogoDisco, versaoAtual: dados?.versao === CACHE_VERSAO }
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
    await writeFile(tmp, JSON.stringify({ ...catalogo, versao: CACHE_VERSAO }), 'utf-8')
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

      if (res.status === 401) {
        // Token aceito na hora de gerar mas rejeitado agora (revogado, sessão
        // derrubada etc.) — sem isto o cache local (válido por até 50min pelo
        // relógio, sem checar se a CISS ainda aceita) fazia TODAS as páginas de
        // TODAS as varreduras falharem com 401 até o TTL local vencer sozinho.
        // Descartar aqui faz a PRÓXIMA varredura pedir um token novo de verdade.
        estado.token = null
      }

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

    // Sem estoque = não tem pra vender. Trata como sem estoque tanto o valor
    // ≤0 quanto a AUSÊNCIA do campo (a CISS não manda `qtdEstoqueAtual` pra
    // ~26% dos produtos, no teste que fizemos — decisão consciente aqui é
    // "na dúvida, esconde": já pegamos produto real fora de estoque assim que
    // não tinha o campo preenchido). Continua no catálogo (não descarta) pra
    // o admin poder ver, buscar e corrigir na mão quando a CISS errar.
    const estoqueBruto = p.qtdEstoqueAtual
    const estoque = estoqueBruto !== undefined && estoqueBruto !== null && estoqueBruto !== ''
      ? Number.parseFloat(estoqueBruto)
      : Number.NaN
    const semEstoque = !(estoque > 0)

    // Promoção: `vlrPromocao` só vale quando preenchido, numérico e menor que
    // o preço normal — o resto (vazio, igual, maior, lixo) é tratado como
    // "sem promoção" em vez de arriscar mostrar preço errado.
    const promoBruta = p.vlrPromocao
    const promo = promoBruta !== undefined && promoBruta !== null && promoBruta !== ''
      ? Number.parseFloat(promoBruta)
      : Number.NaN
    const emPromocao = promo > 0 && promo < preco

    destino.push({
      id,
      nome: p.nome?.trim() || 'Produto sem nome',
      preco2: (emPromocao ? promo : preco).toFixed(2),
      precoOriginal: preco.toFixed(2),
      emPromocao,
      tipo:
        p.subcategoria?.replace(/^\d+\s/, '')?.trim()
        || p.categoria?.trim()
        || p.departamento?.trim()
        || 'Geral',
      img: imagemApi || montarImagem(p.nrcodbarprod || p.codigoBarra),
      imagemReal: Boolean(imagemApi),
      quantidade: 1,
      cat,
      semEstoque,
      ean: String(p.codigoBarra || p.nrcodbarprod || ''),
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
  // Ofertas reais do Clube Alô — sobrepõe (não substitui) o vlrPromocao da
  // CISS: quem já veio marcado por lá continua, a Mercafácil só acrescenta
  // (e corrige o preço) pros que ela conhece. Ver server/utils/mercafacil.ts.
  const ofertasMercafacil = await buscarOfertasMercafacil()
  let novasPromocoes = 0
  for (const p of produtos) {
    const oferta = p.ean ? ofertasMercafacil.get(p.ean) : undefined
    if (!oferta)
      continue
    if (!p.emPromocao)
      novasPromocoes++
    p.precoOriginal = oferta.precoNormal.toFixed(2)
    p.preco2 = oferta.precoOferta.toFixed(2)
    p.emPromocao = true
  }

  const agora = Date.now()
  await publicar(produtos, agora, true)
  estado.proximaTentativa = 0
  const semEstoque = produtos.filter(p => p.semEstoque).length
  const emPromocao = produtos.filter(p => p.emPromocao).length
  log(`[catálogo] ✅ ${produtos.length} produtos (${semEstoque} sem estoque, ${emPromocao} em promoção — ${novasPromocoes} vieram da Mercafácil)`)

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

/** Intervalo mínimo entre acionamentos manuais — clicar várias vezes rápido não deve virar munição extra numa origem instável. */
const COOLDOWN_FORCAR_MS = 60_000

/**
 * Dispara uma varredura completa AGORA, ignorando o cooldown/TTL de 6h —
 * botão "Atualizar agora" do painel de admin, pra quando a CISS muda um preço
 * ou uma promoção acaba e não dá pra esperar a renovação automática. Não
 * bloqueia: dispara em segundo plano e devolve na hora. Se já tiver uma
 * varredura rolando (ou uma acabou de ser forçada há pouco), não duplica —
 * só avisa que já estava em andamento.
 */
export function forcarNovaVarredura(): { jaEmAndamento: boolean } {
  const agora = Date.now()
  const jaEmAndamento = estado.varreduraEmVoo !== null || agora < estado.proximoForcar
  if (!jaEmAndamento) {
    estado.proximoForcar = agora + COOLDOWN_FORCAR_MS
    estado.proximaTentativa = 0
    varrerUmaVez()
  }
  return { jaEmAndamento }
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
    const resultado = await lerDisco()
    if (resultado) {
      const { dados: disco, versaoAtual } = resultado
      // Formato desatualizado: publica os produtos que tem (já servem alguma coisa
      // pro visitante) mas com atualizadoEm=0 — a próxima chamada mais abaixo vai
      // ver isto como "vencido" e disparar uma REVALIDAÇÃO (não um cold-start),
      // que sabe proteger o catálogo anterior se a origem estiver fora do ar.
      await publicar(disco.produtos, versaoAtual ? disco.atualizadoEm : 0, versaoAtual ? disco.completo : true)
      const idade = Math.round((Date.now() - disco.atualizadoEm) / 60_000)
      log(`[catálogo] ⚡ ${disco.produtos.length} produtos do disco (${idade}min atrás)${versaoAtual ? '' : ' — formato antigo, revalidando'}`)
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
 * Produtos-âncora por categoria — o que a maioria já procura de cara, então
 * aparecem primeiro em "Mais relevantes" (comparado por nome, sem acento
 * definido porque a CISS não é consistente em como grava). Índice da lista
 * = ordem de prioridade (arroz antes de feijão antes de macarrão etc.).
 * Categoria sem entrada aqui = comportamento de sempre, sem alteração.
 */
const ANCORAS_POR_CATEGORIA: Partial<Record<Categoria, string[]>> = {
  alimentos: ['ARROZ', 'FEIJAO', 'FEIJÃO', 'MACARRAO', 'MACARRÃO'],
  perfumaria: ['SHAMPOO', 'XAMPU'],
}

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
  opcoes: {
    tipo?: string
    ordenar?: Ordenacao
    incluirOcultos?: boolean
    somenteOcultos?: boolean
    semImagem?: boolean
    /** Inclui produtos sem estoque no resultado — só o painel de admin usa isto. */
    incluirSemEstoque?: boolean
    /** Modo "só sem estoque" (painel de admin, pra listar o que a varredura escondeu). */
    somenteSemEstoque?: boolean
    /** Modo "só em promoção" — usado pela rota pública /api/ofertas e pelo admin. */
    somenteEmPromocao?: boolean
  } = {},
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

    const oculto = produtoEstaOculto(p.id)
    if (opcoes.somenteOcultos) {
      // Modo "só ocultos" (painel de admin, pra listar o que já foi removido): inverte a regra normal.
      if (!oculto)
        continue
    }
    else if (!opcoes.incluirOcultos && oculto) {
      // Produto removido pelo admin: só o próprio painel enxerga (pra poder restaurar).
      continue
    }

    if (opcoes.somenteSemEstoque) {
      if (!p.semEstoque)
        continue
    }
    else if (!opcoes.incluirSemEstoque && p.semEstoque) {
      // Sem estoque na CISS: nunca aparece nas rotas públicas — só o admin, de propósito.
      continue
    }

    // Modo "sem imagem" (painel de admin, pra achar o que falta enriquecer).
    if (opcoes.semImagem && p.imagemReal)
      continue

    // Modo "só em promoção" — página pública de Ofertas e card do admin.
    if (opcoes.somenteEmPromocao && !p.emPromocao)
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

  // "Mais relevantes" (padrão, sem busca): dentro de UMA categoria só, alguns
  // produtos-âncora aparecem primeiro — o que a maioria já vai procurar de
  // cara, em vez de depender da ordem arbitrária que a CISS mandou. Roda por
  // último de propósito (sort estável): vira o critério PRINCIPAL, e dentro
  // de cada âncora a ordem por imagem-real de cima continua valendo.
  if ((!opcoes.ordenar || opcoes.ordenar === 'relevancia') && !termo && typeof categoria === 'string') {
    const ancoras = ANCORAS_POR_CATEGORIA[categoria]
    if (ancoras?.length) {
      const rank = (p: Produto) => {
        const nome = p.nome.toUpperCase()
        const i = ancoras.findIndex(palavra => nome.includes(palavra))
        return i === -1 ? ancoras.length : i
      }
      filtrados.sort((a, b) => rank(a) - rank(b))
    }
  }

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

// ═══════════════════════ ESTATÍSTICAS (dashboard do /admin) ═══════════════════════

export interface Estatisticas {
  total: number
  semImagem: number
  semEstoque: number
  emPromocao: number
  ocultos: number
  overridesManuais: number
  porCategoria: Record<Categoria, number>
  catalogo: { atualizadoEm: number, completo: boolean, idadeMin: number }
  cosmos: { habilitado: boolean, usadosHoje: number, limiteDiario: number }
}

/**
 * Números pro dashboard do painel de admin. Lê só o catálogo já publicado em
 * memória — nunca dispara varredura nova nem consulta a Cosmos (isso ficaria
 * caro rápido, já que o painel pode ser recarregado a qualquer hora).
 */
export async function obterEstatisticas(): Promise<Estatisticas> {
  const catalogo = await getCatalogo()
  await carregarOcultos()
  await carregarOverrides()
  await lerCosmosDisco()

  let semImagem = 0
  let semEstoque = 0
  let emPromocao = 0
  const porCategoria: Record<Categoria, number> = { alimentos: 0, bebidas: 0, limpeza: 0, perfumaria: 0 }
  for (const p of catalogo.produtos) {
    if (!p.imagemReal)
      semImagem++
    if (p.semEstoque)
      semEstoque++
    if (p.emPromocao)
      emPromocao++
    for (const chave of Object.keys(CAT) as Categoria[]) {
      if (p.cat & CAT[chave])
        porCategoria[chave]++
    }
  }

  const hoje = new Date().toISOString().slice(0, 10)
  const usadosHoje = estadoCosmos.orcamento.dia === hoje ? estadoCosmos.orcamento.usados : 0

  return {
    total: catalogo.produtos.length,
    semImagem,
    semEstoque,
    emPromocao,
    ocultos: Object.keys(estadoOcultos.dados).length,
    overridesManuais: Object.keys(estadoOverrides.dados).length,
    porCategoria,
    catalogo: {
      atualizadoEm: catalogo.atualizadoEm,
      completo: catalogo.completo,
      idadeMin: catalogo.atualizadoEm ? Math.round((Date.now() - catalogo.atualizadoEm) / 60_000) : -1,
    },
    cosmos: {
      habilitado: Boolean(COSMOS_TOKEN),
      usadosHoje,
      limiteDiario: COSMOS_LIMITE_DIARIO,
    },
  }
}
