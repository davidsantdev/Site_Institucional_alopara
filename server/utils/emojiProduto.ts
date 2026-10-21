/**
 * Emoji de um produto de hortifruti ou do açougue — usado no lugar da foto
 * quando não existe foto de verdade. A CISS não manda foto, e produto pesado
 * (banana, picanha...) tem código interno curto, então não dá pra achar foto
 * pelo código de barras (ver montarImagem() em catalogo.ts). Melhor um emoji
 * certo do que uma foto errada ou um quadrado vazio.
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

/**
 * Açougue e frios — mesma ideia: a carne pesada (picanha, músculo, coxa) é
 * cortada na loja e não tem código de barras nem foto. Do mais específico pro
 * mais genérico: "FILE DE PEITO FRANGO" é frango antes de ser "FILE";
 * "BISTECA SUINA" é porco antes de ser bisteca.
 */
const EMOJIS_ACOUGUE: [string[], string][] = [
  [['CAMARAO'], '🦐'],
  [['PEIXE', 'TILAPIA', 'PESCADA', 'MERLUZA', 'SARDINHA', 'SALMAO', 'TAMBAQUI', 'PIRARUCU', 'DOURADA', 'PESCADO'], '🐟'],
  [['PIZZA'], '🍕'],
  [['LASANHA'], '🍝'],
  // Frios antes de bacon e frango: "MORTADELA DE FRANGO" e "MORTADELA S/TOUCINHO" são mortadela.
  [['PRESUNTO', 'APRESUNTADO', 'MORTADELA', 'SALAME', 'BLANQUET'], '🥪'],
  [['BACON', 'TOUCINHO', 'TORRESMO', 'PANCETA'], '🥓'],
  [['LINGUICA', 'SALSICHA', 'CALABRESA', 'PAIO', 'CHOURICO'], '🌭'],
  [['HAMBURGUER', 'HAMBURGER', 'BURGER'], '🍔'],
  [['QUEIJO', 'MUSSARELA', 'MUCARELA', 'PROVOLONE', 'PARMESAO', 'REQUEIJAO', 'RICOTA', 'COALHO'], '🧀'],
  [['MARGARINA', 'MANTEIGA'], '🧈'],
  [['OVO'], '🥚'],
  [['FRANGO', 'GALINHA', 'COXA', 'SOBRECOXA', 'ASA', 'PEITO', 'FILEZINHO', 'MOELA', 'CHESTER', 'PERU'], '🍗'],
  [['SUINO', 'SUINA', 'PORCO', 'PERNIL', 'LOMBO'], '🍖'],
  [['CARNE', 'BOVINO', 'BOVINA', 'PICANHA', 'ALCATRA', 'MUSCULO', 'COSTELA', 'FILE', 'MIGNON', 'MAMINHA', 'FRALDINHA', 'COXAO', 'PATINHO', 'ACEM', 'CUPIM', 'LAGARTO', 'CHARQUE', 'BIFE', 'BISTECA', 'FIGADO', 'DOBRADINHA', 'BUCHO', 'MOCOTO'], '🥩'],
]

/** Uma regex por emoji, montada uma vez: palavra inteira, com "S" de plural opcional. */
function montarRegras(lista: [string[], string][]) {
  return lista.map(([palavras, emoji]) => ({
    emoji,
    regex: new RegExp(`(?:^|[^A-Z])(?:${palavras.join('|')})S?(?:[^A-Z]|$)`),
  }))
}

const REGRAS = montarRegras(EMOJIS)
const REGRAS_ACOUGUE = montarRegras(EMOJIS_ACOUGUE)

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
 * Emoji pro produto, ou '' se não der pra saber. No hortifruti, sem palavra
 * conhecida, cai no genérico do prefixo da CISS (F = fruta, V = verdura) — se
 * nem isso, '' e a tela mostra a imagem padrão de "sem foto".
 */
export function emojiProduto(nome: string, secao: 'hortifruti' | 'acougue' = 'hortifruti'): string {
  const { texto, prefixo } = normalizar(nome)
  if (secao === 'acougue')
    return REGRAS_ACOUGUE.find(r => r.regex.test(texto))?.emoji ?? ''

  const achado = REGRAS.find(r => r.regex.test(texto))
  if (achado)
    return achado.emoji
  if (prefixo === 'F')
    return '🍎'
  if (prefixo === 'V')
    return '🥬'
  return ''
}
