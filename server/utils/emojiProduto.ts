/**
 * Emoji de um produto de hortifruti — usado no lugar da foto quando não existe
 * foto de verdade. A CISS não manda foto, e produto pesado (banana, tomate...)
 * tem código interno curto, então não dá pra achar foto pelo código de barras
 * (ver montarImagem() em catalogo.ts). Melhor um emoji certo do que uma foto
 * errada ou um quadrado vazio.
 *
 * A ordem da lista importa: a primeira que casar vence ("BATATA DOCE" tem que
 * vir antes de "BATATA"). Casa por palavra inteira — "PERA" não pode pegar
 * "TEMPERADO".
 */

const EMOJIS: [string[], string][] = [
  // Frutas
  [['BANANA'], '🍌'],
  [['MACA'], '🍎'],
  [['PERA'], '🍐'],
  [['GOIABA'], '🍐'],
  [['UVA', 'PASSAS', 'JABUTICABA'], '🍇'],
  [['LARANJA', 'TANGERINA', 'MEXERICA', 'BERGAMOTA', 'PONKAN', 'TORANJA'], '🍊'],
  [['LIMAO', 'LIMA'], '🍋'],
  [['ABACAXI'], '🍍'],
  [['MELANCIA'], '🍉'],
  [['MELAO', 'MARACUJA'], '🍈'],
  [['MORANGO'], '🍓'],
  [['CEREJA', 'ACEROLA'], '🍒'],
  [['PESSEGO', 'NECTARINA', 'AMEIXA', 'DAMASCO'], '🍑'],
  [['MANGA', 'MAMAO'], '🥭'],
  [['COCO'], '🥥'],
  [['KIWI'], '🥝'],
  [['ABACATE'], '🥑'],
  [['AMORA', 'MIRTILO', 'BLUEBERRY'], '🫐'],
  // Castanhas
  [['AMENDOIM'], '🥜'],
  [['CASTANHA', 'CASTANHAS', 'NOZ', 'NOZES'], '🌰'],
  // Legumes e verduras
  [['TOMATE'], '🍅'],
  [['BERINJELA'], '🍆'],
  [['BATATA DOCE', 'INHAME', 'BETERRABA'], '🍠'],
  [['BATATA', 'MANDIOCA', 'AIPIM', 'MACAXEIRA'], '🥔'],
  [['CENOURA'], '🥕'],
  [['MILHO'], '🌽'],
  [['PIMENTAO'], '🫑'],
  [['PIMENTA'], '🌶️'],
  [['PEPINO', 'ABOBRINHA', 'CHUCHU', 'QUIABO', 'VAGEM'], '🥒'],
  [['BROCOLIS', 'COUVE FLOR', 'COUVEFLOR'], '🥦'],
  [['ALFACE', 'COUVE', 'REPOLHO', 'RUCULA', 'AGRIAO', 'ESPINAFRE', 'ACELGA', 'CHICORIA', 'ESCAROLA', 'RABANETE'], '🥬'],
  [['CHEIRO VERDE', 'SALSA', 'SALSINHA', 'COENTRO', 'CEBOLINHA', 'HORTELA', 'MANJERICAO', 'ALECRIM', 'ORAGANO'], '🌿'],
  [['ALHO'], '🧄'],
  [['CEBOLA'], '🧅'],
  [['COGUMELO', 'CHAMPIGNON', 'SHIITAKE', 'SHIMEJI'], '🍄'],
  [['ABOBORA', 'MORANGA', 'JERIMUM'], '🎃'],
  [['OVO', 'OVOS'], '🥚'],
]

/** Uma regex por emoji, montada uma vez: palavra inteira, com "S" de plural opcional. */
const REGRAS = EMOJIS.map(([palavras, emoji]) => ({
  emoji,
  regex: new RegExp(`(?:^|[^A-Z])(?:${palavras.join('|')})S?(?:[^A-Z]|$)`),
}))

/** "F BANANA PRATA OTHIL" → "BANANA PRATA OTHIL" (F = fruta, V = verdura/vegetal — prefixo da própria CISS). */
function normalizar(nome: string): { texto: string, prefixo: 'F' | 'V' | '' } {
  const texto = nome
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/-/g, ' ')
    .trim()
  const prefixo = /^([FV]) /.exec(texto)?.[1] as 'F' | 'V' | undefined
  return { texto: prefixo ? texto.slice(2) : texto, prefixo: prefixo ?? '' }
}

/**
 * Emoji pro produto, ou '' se não der pra saber. Sem palavra conhecida, cai no
 * genérico do prefixo da CISS (F = fruta, V = verdura) — se nem isso, '' e a
 * tela mostra a imagem padrão de "sem foto".
 */
export function emojiProduto(nome: string): string {
  const { texto, prefixo } = normalizar(nome)
  const achado = REGRAS.find(r => r.regex.test(texto))
  if (achado)
    return achado.emoji
  if (prefixo === 'F')
    return '🍎'
  if (prefixo === 'V')
    return '🥬'
  return ''
}
