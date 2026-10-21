/**
 * Formatação de texto e preço pra EXIBIÇÃO. A CISS manda nome de produto em
 * caixa alta, sem acento e cheio de abreviação ("ACUCAR CRISTAL 5KG",
 * "ABS INTIMUS C/ABAS 8UN") — difícil de ler numa grade de 40 produtos.
 *
 * Só muda o que a pessoa VÊ: o nome original continua sendo a chave do
 * carrinho e vai cru na mensagem do WhatsApp (é o que o atendente procura
 * no sistema da loja).
 */

const CONECTIVOS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'COM', 'SEM', 'EM', 'NA', 'NO', 'NAS', 'NOS', 'PARA', 'A', 'O', 'AO', 'AOS', 'OU', 'POR', 'PELO', 'PELA'])

/** Siglas que têm vogal (as sem vogal — SCH, FPS, XG — já ficam em caixa alta sozinhas). */
const SIGLAS = new Set(['UHT', 'PET', 'USB', 'LED', 'DVD', 'TV'])

/** Abreviações de tratamento, que a regra "sem vogal = sigla" pegaria por engano. */
const TRATAMENTOS: Record<string, string> = { DR: 'Dr', DRA: 'Dra', SR: 'Sr', STA: 'Sta', STO: 'Sto' }

/** Primeira palavra abreviada pela CISS que vale a pena escrever por extenso. */
const EXPANSOES_INICIAIS: Record<string, string> = { ABS: 'Absorvente' }

/**
 * Palavras de mercado que a CISS grava sem acento — só as inequívocas (nada
 * que possa ser nome de marca ou ter outro sentido sem o acento).
 */
const ACENTOS: Record<string, string> = {
  ACAFRAO: 'Açafrão',
  ACAI: 'Açaí',
  ACEM: 'Acém',
  ACUCAR: 'Açúcar',
  AGUA: 'Água',
  ALCOOL: 'Álcool',
  ALGODAO: 'Algodão',
  AMENDOA: 'Amêndoa',
  ABOBORA: 'Abóbora',
  BROCOLIS: 'Brócolis',
  CACHACA: 'Cachaça',
  CAFE: 'Café',
  CAMARAO: 'Camarão',
  CHA: 'Chá',
  CORACAO: 'Coração',
  CORACOES: 'Corações',
  COXAO: 'Coxão',
  COLORIFICO: 'Colorífico',
  DENDE: 'Dendê',
  DESCARTAVEL: 'Descartável',
  DESCARTAVEIS: 'Descartáveis',
  ENERGETICO: 'Energético',
  FECULA: 'Fécula',
  FEIJAO: 'Feijão',
  FIGADO: 'Fígado',
  FILE: 'Filé',
  GAS: 'Gás',
  GRAO: 'Grão',
  GRAOS: 'Grãos',
  HIGIENICO: 'Higiênico',
  INSTANTANEO: 'Instantâneo',
  ISOTONICO: 'Isotônico',
  LACTEA: 'Láctea',
  LACTEO: 'Lácteo',
  LENCO: 'Lenço',
  LENCOS: 'Lenços',
  LIMAO: 'Limão',
  LINGUICA: 'Linguiça',
  LIQUIDO: 'Líquido',
  MACA: 'Maçã',
  MACARRAO: 'Macarrão',
  MAMAO: 'Mamão',
  MARACUJA: 'Maracujá',
  MELAO: 'Melão',
  MUSCULO: 'Músculo',
  NAO: 'Não',
  OLEO: 'Óleo',
  OREGANO: 'Orégano',
  PAO: 'Pão',
  PAES: 'Pães',
  PESSEGO: 'Pêssego',
  PIMENTAO: 'Pimentão',
  PO: 'Pó',
  PURE: 'Purê',
  REQUEIJAO: 'Requeijão',
  SABAO: 'Sabão',
  SAUDE: 'Saúde',
  SOLUVEL: 'Solúvel',
  SANITARIA: 'Sanitária',
  TRADICAO: 'Tradição',
  LIMOES: 'Limões',
  FEIJOES: 'Feijões',
  JOAO: 'João',
  SAO: 'São',
}

const UNIDADES: Record<string, string> = { KG: 'kg', G: 'g', GR: 'g', GRS: 'g', MG: 'mg', ML: 'ml', L: 'L', LT: 'L', LTS: 'L', UN: 'un', UND: 'un', UNID: 'un', M: 'm', CM: 'cm', MM: 'mm', W: 'W', V: 'V', H: 'h' }
const UNIDADE_COLADA = /^(\d+(?:[.,]\d+)?)(KG|GRS|GR|G|MG|ML|LTS|LT|L|UNID|UND|UN|CM|MM|[MWVH])$/
/** Unidade de venda solta no fim do nome ("BANANA PRATA KG") — a tela já mostra "/kg". */
const UNIDADE_DE_VENDA = new Set(['KG', 'UN', 'UND', 'UNID'])
const PREFIXOS_BARRA = new Set(['C', 'S', 'P'])
const VOGAL = /[AEIOUÁÉÍÓÚÂÊÔÃÕÀÜ]/
const SEPARADOR = /^[-./`']$/

function palavra(p: string): string {
  if (!p || /\d/.test(p))
    return p
  if (TRATAMENTOS[p])
    return TRATAMENTOS[p]
  if (ACENTOS[p])
    return ACENTOS[p]
  if (SIGLAS.has(p) || (p.length <= 4 && !VOGAL.test(p)))
    return p
  return p.charAt(0) + p.slice(1).toLowerCase()
}

/** "DR.OETKER" → "Dr. Oetker", "LEAVE-IN" → "Leave-In", "AZUL/VERMELHO" → "Azul/Vermelho". */
function comPartes(p: string): string {
  return p
    .split(/([-./`'])/)
    .map(x => (SEPARADOR.test(x) ? x : palavra(x)))
    .join('')
    .replace(/\b(Dra?|Sra?|Sto|Sta)\.(?=\p{L})/gu, '$1. ')
}

/** "(AMPLA" → ["(", "AMPLA", ""]: pontuação em volta fica intacta, só o miolo é formatado. */
function separarPontuacao(t: string): [string, string, string] {
  const inicio = t.search(/[\p{L}\p{N}]/u)
  if (inicio === -1)
    return [t, '', '']
  let fim = t.length
  while (fim > inicio && !/[\p{L}\p{N}%]/u.test(t.charAt(fim - 1)))
    fim--
  return [t.slice(0, inicio), t.slice(inicio, fim), t.slice(fim)]
}

function formatarToken(t: string, i: number, todos: string[]): string {
  const [antes, meio, depois] = separarPontuacao(t)
  if (!meio)
    return t

  const anterior = todos[i - 1] ?? ''
  const proximo = todos[i + 1]
  const unidade = UNIDADE_COLADA.exec(meio)
  let r: string

  if (unidade) {
    r = `${unidade[1] ?? ''}${UNIDADES[unidade[2] ?? ''] ?? ''}`
  }
  else if (meio in UNIDADES && /\d$/.test(anterior)) {
    r = UNIDADES[meio]!
  }
  else if (/^[A-Z]{3,}\d+$/.test(meio)) {
    const [, letras = '', numero = ''] = /^([A-Z]+)(\d+)$/.exec(meio) ?? []
    r = `${palavra(letras)} ${numero}`
  }
  else if (meio.includes('/') && PREFIXOS_BARRA.has(meio.split('/')[0]!)) {
    const [pre = '', ...resto] = meio.split('/')
    const cauda = resto.join('/')
    r = `${pre.toLowerCase()}/${cauda ? ` ${formatarToken(cauda, 1, [`${pre}/`, cauda])}` : ''}`
  }
  else if (i > 0 && CONECTIVOS.has(meio)) {
    // "e"/"a"/"o" soltos só são conectivo entre duas palavras — "VITAMINA E 10ML" é a vitamina E.
    const vizinhosSaoPalavras = proximo !== undefined && /^\p{L}/u.test(proximo) && /\p{L}$/u.test(anterior)
    r = meio.length > 1 || vizinhosSaoPalavras ? meio.toLowerCase() : meio
  }
  else {
    r = comPartes(meio)
  }
  return antes + r + depois
}

/** Nome de produto pra exibir: "ACUCAR CRISTAL CARAVELAS 5KG" → "Açúcar Cristal Caravelas 5kg". */
export function formatarNome(nome: string | null | undefined): string {
  const limpo = String(nome ?? '').replace(/\s+/g, ' ').trim()
  // Já vem em caixa mista (cadastro feito à mão)? Respeita como está.
  if (!limpo || limpo !== limpo.toUpperCase())
    return limpo

  let tokens = limpo.split(' ')
  // Prefixo de hortifruti da CISS ("F BANANA", "V ALFACE") — código interno, não nome.
  if (tokens.length > 1 && /^[FV]$/.test(tokens[0]!) && /^\p{L}{2,}/u.test(tokens[1]!))
    tokens = tokens.slice(1)
  if (tokens.length > 1 && UNIDADE_DE_VENDA.has(tokens.at(-1)!) && !/\d$/.test(tokens.at(-2)!))
    tokens = tokens.slice(0, -1)

  return tokens
    .map((t, i) => (i === 0 && EXPANSOES_INICIAIS[t]) ? EXPANSOES_INICIAIS[t] : formatarToken(t, i, tokens))
    .join(' ')
}

/** Subcategoria (chip de filtro): "ACHOCOLATADOS ATÉ 300G" → "Achocolatados até 300g". */
export function formatarTipo(tipo: string | null | undefined): string {
  const limpo = String(tipo ?? '').replace(/\s+/g, ' ').trim()
  if (!limpo || limpo !== limpo.toUpperCase())
    return limpo
  const frase = limpo
    .toLowerCase()
    .replace(/(\d+(?:[.,]\d+)?)\s?(kg|grs|gr|g|mg|ml|lts|lt|l|un|und)\b/g, (_, n: string, u: string) => n + (UNIDADES[u.toUpperCase()] ?? u))
  return frase.charAt(0).toUpperCase() + frase.slice(1)
}

const REAIS = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 6.9 → "6,90"; 1299.9 → "1.299,90" (sem o "R$" — a tela decide como mostrar). */
export function formatarReais(valor: number | string | null | undefined): string {
  const n = typeof valor === 'number' ? valor : Number.parseFloat(String(valor ?? '').replace(',', '.'))
  return REAIS.format(Number.isFinite(n) ? n : 0)
}
