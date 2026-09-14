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
      existente.quantidade += quantidade
    }
    else {
      carrinho.value.push({ ...produto, quantidade })
    }

    toast.success('Adicionado ao carrinho', {
      description: produto.nome,
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
