import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'

// Os produtos vêm de fontes diferentes (categorias, ofertas, cosmos) e nem
// todas usam o mesmo nome de campo pra preço — algumas com acento, outras
// sem. Fica num único lugar pra não duplicar essa cadeia de fallback em
// cada tela que precisa do valor em número (carrinho, checkout, Analytics).
export function precoUnitario(produto: any): number {
  const bruto = produto?.preco2 ?? produto?.preço2 ?? produto?.preço ?? produto?.preco ?? '0'
  return Number.parseFloat(String(bruto).replace(',', '.')) || 0
}

// ═════════════ PRODUTO VENDIDO POR PESO ═════════════
// Produto pesado (`pesavel`, ver normalizar() em catalogo.ts): o preço é POR KG
// e a `quantidade` no carrinho é em KG — 0.5 = 500 g. Tudo que soma, mostra ou
// manda pro WhatsApp passa pelas funções daqui, pra gramas e centavos nunca
// ficarem cada um com uma conta diferente.

export const PESO = {
  /** Menor pedido (g). */
  MIN_GRAMAS: 50,
  /** Passo dos botões − / + (g) — o campo de gramas aceita qualquer valor. */
  PASSO_GRAMAS: 100,
  /** Teto (g): 20 kg. */
  MAX_GRAMAS: 20_000,
  /** O que entra quando a pessoa toca no "+" rápido do card (g). */
  PADRAO_GRAMAS: 500,
} as const

/** kg → "500 g", "1 kg", "1,5 kg". Trabalha em gramas inteiras (sem 0.30000000000000004). */
export function formatarPeso(kg: number): string {
  const gramas = Math.round(kg * 1000)
  if (gramas < 1000)
    return `${gramas} g`
  return `${(gramas / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`
}

/** Quantidade como aparece pra pessoa: "500 g" no produto pesado, "3" no resto. */
export function rotuloQuantidade(item: any): string {
  const quantidade = item?.quantidade ?? 1
  return item?.pesavel ? formatarPeso(quantidade) : String(quantidade)
}

/** Preço do item × quantidade, arredondado no centavo. Peso: preço/kg × kg (500 g de R$ 6,99/kg = R$ 3,50). */
export function subtotalItem(item: any): number {
  const quantidade = item?.quantidade ?? 1
  const centavos = Math.round(precoUnitario(item) * 100)
  return Math.round(centavos * quantidade) / 100
}

/** Soma dois pesos em kg sem acumular erro de ponto flutuante (mil gramas por vez). */
function somarQuantidade(atual: number, extra: number, pesavel: boolean): number {
  return pesavel ? Math.round((atual + extra) * 1000) / 1000 : atual + extra
}

export function useCarrinho() {
  const carrinho = useState<any[]>('carrinho', () => [])

  if (import.meta.client && carrinho.value.length === 0) {
    try {
      const salvo = localStorage.getItem('carrinho')
      if (salvo)
        carrinho.value = JSON.parse(salvo)
    }
    catch {
      // localStorage indisponível (modo privado, cookies bloqueados) — segue com carrinho vazio.
    }
  }

  watch(
    carrinho,
    () => {
      if (import.meta.client) {
        try {
          localStorage.setItem('carrinho', JSON.stringify(carrinho.value))
        }
        catch {
          // Sem storage disponível: o carrinho continua funcionando na sessão atual.
        }
      }
    },
    { deep: true },
  )

  const totalItens = computed(() => {
    if (carrinho.value.length === 0) {
      return { total: '', vazio: true, compra: false }
    }
    return { total: carrinho.value.length, vazio: false, compra: true }
  })

  function adicionarCarrinho(produto: any, quantidade: number = 1) {
    const existente = carrinho.value.find((p: any) => p.nome === produto.nome)
    if (existente) {
      existente.quantidade = somarQuantidade(existente.quantidade, quantidade, Boolean(produto.pesavel))
    }
    else {
      carrinho.value.push({ ...produto, quantidade })
    }

    toast.success('Adicionado ao carrinho', {
      description: produto.pesavel ? `${produto.nome} — ${formatarPeso(quantidade)}` : produto.nome,
    })

    // GA4 Ecommerce — faltava por completo: o Analytics só via o clique final
    // no WhatsApp, nunca o "adicionar ao carrinho" (é aqui que TODO botão de
    // adicionar de qualquer categoria/página cai, ver grep por adicionarCarrinho).
    const preco = precoUnitario(produto)
    const { gtag } = useGtag()
    gtag('event', 'add_to_cart', {
      currency: 'BRL',
      value: preco * quantidade,
      items: [{
        item_id: String(produto.id ?? produto.nome),
        item_name: produto.nome,
        price: preco,
        quantity: quantidade,
      }],
    })
  }

  function removeItem(nome: string) {
    carrinho.value = carrinho.value.filter((p: any) => p.nome !== nome)
    toast('Item removido do carrinho')
  }

  function esvaziarCarrinho() {
    if (carrinho.value.length === 0)
      return
    carrinho.value = []
    toast('Carrinho esvaziado')
  }

  return { carrinho, adicionarCarrinho, removeItem, esvaziarCarrinho, totalItens }
}
