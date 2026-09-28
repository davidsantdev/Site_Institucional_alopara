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

/** Preço do item × quantidade, arredondado no centavo (evita erro de ponto flutuante ao somar reais). */
export function subtotalItem(item: any): number {
  const quantidade = item?.quantidade ?? 1
  const centavos = Math.round(precoUnitario(item) * 100)
  return Math.round(centavos * quantidade) / 100
}

/** 6.9 → "6,90" — o carrinho e a mensagem do WhatsApp mostram com vírgula. */
export function formatarReais(valor: number): string {
  return valor.toFixed(2).replace('.', ',')
}

/** Uma linha do pedido que vai pro WhatsApp. */
export function linhaPedido(item: any, posicao: number): string {
  return [
    `${posicao}. ${item.nome}`,
    `   Quantidade: ${item.quantidade ?? 1} — R$ ${formatarReais(subtotalItem(item))}`,
  ].join('\n')
}

/** "Desfazer" o pedido enviado: o que estava no carrinho + o que a pessoa adicionou depois, sem repetir (vale o item atual). */
export function restaurarItens(anteriores: any[], atuais: any[]): any[] {
  return [...anteriores.filter(item => !atuais.some(atual => atual.nome === item.nome)), ...atuais]
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

  /**
   * Zera o carrinho depois que o pedido foi pro WhatsApp. O pedido não fica
   * registrado em lugar nenhum além da conversa, então, se a pessoa voltar do
   * WhatsApp sem ter enviado a mensagem, perderia a lista inteira — por isso o
   * aviso tem "Desfazer" (junta o que estava com o que ela tiver adicionado
   * depois, sem duplicar).
   */
  function concluirPedido() {
    const itens = carrinho.value
    carrinho.value = []
    toast.success('Pedido enviado pro WhatsApp', {
      description: 'Seu carrinho foi esvaziado.',
      duration: 12_000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          carrinho.value = restaurarItens(itens, carrinho.value)
        },
      },
    })
  }

  return { carrinho, adicionarCarrinho, removeItem, esvaziarCarrinho, concluirPedido, totalItens }
}
