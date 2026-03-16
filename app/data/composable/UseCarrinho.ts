import { ref } from "vue"


const carrinho = ref <any[]>([])

export function useCarrinho(){
  return { carrinho }
}