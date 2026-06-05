import { computed, watch } from 'vue'

export function useCarrinho() {
  const carrinho = useState<any[]>('carrinho', () => [])

  if (process.client && carrinho.value.length === 0) {
    const salvo = localStorage.getItem('carrinho')
    if (salvo) {
      carrinho.value = JSON.parse(salvo)
    }
  }

  watch(
    carrinho,
    () => {
      if (process.client) {
        localStorage.setItem('carrinho', JSON.stringify(carrinho.value))
      }
    },
    { deep: true }
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
    } else {
      carrinho.value.push({ ...produto, quantidade })
    }
  }

  function removeItem(nome: string) {
    carrinho.value = carrinho.value.filter((p: any) => p.nome !== nome)
  }

  return { carrinho, adicionarCarrinho, removeItem, totalItens }
}