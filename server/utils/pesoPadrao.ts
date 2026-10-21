/**
 * Regra automática de "vendido por peso" (preço por KG + a pessoa escolhe as
 * gramas) — só no Hortifruti:
 *  - a CISS marcou `KG` → por peso;
 *  - FRUTA (a CISS prefixa o nome com "F ") sem peso/embalagem no nome → por
 *    peso, mesmo marcada como UN. A CISS erra aí (cereja, figo, laranja e uva
 *    vêm como UN mas são por quilo) e o dono pediu: fruta é por kg. Ficam de
 *    fora abacaxi, coco e "inteira", que são por unidade de verdade.
 * Verdura ("V ") segue o que a CISS diz. Fora do hortifruti nunca é automático:
 * lá a CISS marca KG até em embalado (camarão congelado de 800G) e mostrar
 * "escolha as gramas" num pacote fechado seria errado. O que a regra errar o
 * dono corrige no painel (definirOverridePeso, em catalogo.ts).
 */

/** Peso/embalagem no nome ("1KG", "300G", "C/20", "20X1", "BDJ", "PCT"...): já é um item fechado, não se pesa. */
const EMBALAGEM_NO_NOME = /\d+\s*(?:G|GR|GRS|KG|ML|L|UN|UND)\b|C\/\s*\d+|\d+\s*X\s*\d+|\b(?:BDJ|PCT|CX\d*|DZ|MACO|BANDEJA)\b/i

/** Fruta que se vende por unidade mesmo (abacaxi, coco, melancia "inteira") — fora da regra "fruta = por kg". */
const FRUTA_POR_UNIDADE = /\b(?:ABACAXI|COCO|INTEIR[AO])\b/i

export function pesavelPorPadrao(produto: { hortifruti: boolean, unidade: string, nome: string }): boolean {
  if (!produto.hortifruti)
    return false
  if (produto.unidade === 'KG')
    return true
  return /^F\s/i.test(produto.nome)
    && !EMBALAGEM_NO_NOME.test(produto.nome)
    && !FRUTA_POR_UNIDADE.test(produto.nome)
}
