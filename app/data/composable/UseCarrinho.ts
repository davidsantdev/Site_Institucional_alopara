import { watch } from "vue"


export function useCarrinho(){

  const carrinho = useState<any[]>("carrinho", () => [])

  // carregar do localStorage (client only)
  if (process.client && carrinho.value.length === 0) {
    const salvo = localStorage.getItem("carrinho")
    if (salvo) {
      carrinho.value = JSON.parse(salvo)
    }
  }

  watch( carrinho, () => {
      if (process.client) {
        localStorage.setItem(
          "carrinho",
          JSON.stringify(carrinho.value)
        )
      }
    },
    { deep: true }
  )

  function adicionarCarrinho(produto: any, quantidade: number = 1) {
    const existente = carrinho.value.find(
      (p: any) => p.id === produto.id
    )  

    if (existente) {
      existente.quantidade += quantidade
    } else {
      carrinho.value.push({
        ...produto,
        quantidade
      })
    }
  }

  return { carrinho, adicionarCarrinho }
}