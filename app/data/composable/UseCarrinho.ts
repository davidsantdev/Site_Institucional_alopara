import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'

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
