<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import LimpezaJson from "../data/produtosLimpeza.json"

import { Flame, ShoppingBasket } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";

import { ref, computed } from "vue"
import { useCarrinho } from "~/data/composable/UseCarrinho"

const { adicionarCarrinho } = useCarrinho()

const produtoSelecionado = ref<any>(null)

// 🔥 CORREÇÃO PRINCIPAL (REATIVIDADE)
const produtos = ref(
  LimpezaJson.map(p => ({
    ...p,
    quantidade: 1
  }))
)

// PAGINAÇÃO
const PaginaAtual = ref(1)
const ItensPorPagina = 10 

const totalPaginas = computed(() => 
  Math.ceil(produtos.value.length / ItensPorPagina)
)

const produtosPaginados = computed(() => {
  const inicio = (PaginaAtual.value - 1) * ItensPorPagina
  const fim = inicio + ItensPorPagina
  return produtos.value.slice(inicio, fim)
})

function irParaPagina(pagina: number){
  PaginaAtual.value = pagina
}

// AUMENTAR
function aumentar(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item) item.quantidade++
}

// DIMINUIR
function diminuir(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item && item.quantidade > 1) {
    item.quantidade--
  }
}
</script>

<template>
<div class="bg-[#F4F4F4] flex flex-col justify-center ">
  <HeaderMain/>

  <div class="bg-red-500 h-[100px] items-center flex justify-center">
    <h3 class="text-[27px] font-bold p-5">
      Produtos de limpeza mais comprados do Alô Pará
    </h3>
  </div>

  <div>
    <div class="p-4 flex flex gap-1 flex-wrap">
      <Button @click="navigateTo('/Alimentos')" variant="link" class="text-blue-500 text-[17px]">Alimentos</Button>
      <Button @click="navigateTo('/Limpeza')" variant="link" class="text-blue-500 text-[17px]">Limpeza</Button>
      <Button @click="navigateTo('/Perfumaria')" variant="link" class="text-blue-500 text-[17px]">Perfumaria</Button>
      <Button @click="navigateTo('/Vinhos')" variant="link" class="text-blue-500 text-[17px]">Vinhos</Button>
      <Button @click="navigateTo('/Bebidas')" variant="link" class="text-blue-500 text-[17px]">Bebidas</Button>
    </div>

    <!-- PAGINAÇÃO -->
    <div class="flex justify-center gap-2 m-10 flex-wrap">
      <button @click="PaginaAtual > 1 && PaginaAtual--" class="px-3 py-1 bg-red-500 rounded">
        Anterior
      </button>

      <button
        v-for="page in totalPaginas"
        :key="page"
        @click="irParaPagina(page)"
        :class="[
          'px-3 py-1 rounded',
          page === PaginaAtual ? 'bg-red-500 text-white' : 'bg-red-400'
        ]"
      >
        {{ page }}
      </button>

      <button @click="PaginaAtual < totalPaginas && PaginaAtual++" class="px-3 py-1 bg-red-500 rounded">
        Próximo
      </button>
    </div>

    <!-- PRODUTOS -->
    <div class="flex justify-center flex-col items-center">
      <div class="flex justify-center items-center flex-col">
        <div class="w-[100%]">
          <div class="relative items-center md:w-full flex justify-center p-3">
            <div class="flex md:gap-15 gap-1 flex-wrap md:px-4 justify-center ">

              <Dialog v-for="L in produtosPaginados" :key="L.id">

                <DialogTrigger as-child>
                  <div class="relative border border-slate-200 bg-white rounded-2xl shadow-md hover:shadow-xl 
                  transition-all duration-300 cursor-pointer md:w-[280px] w-[48%] overflow-hidden group">

                    <div class="absolute top-3 left-3 z-10 bg-orange-500 text-white text-[10px] font-bold 
                      px-2 py-1 rounded-full flex items-center gap-1 shadow">
                      Mais vendido <Flame :size="11"/>
                    </div>

                    <button 
                      @click.stop="adicionarCarrinho(L, 1)" 
                      class="absolute top-3 right-3 z-10 bg-green-500 hover:bg-green-600 text-white 
                      w-8 h-8 rounded-full text-xl font-bold shadow flex items-center justify-center"
                    >+</button>

                    <div class="flex items-center justify-center bg-slate-50 h-44 p-4 
                      group-hover:bg-red-100 transition-colors duration-300">
                      <img class="md:w-36 w-24 object-contain" :src="L.img" alt="">
                    </div>

                    <div class="p-4 flex flex-col gap-2">
                      <h3 class="text-[13px] md:text-[15px] text-slate-800 font-semibold text-center">
                        {{ L.nome }}
                      </h3>

                      <div class="flex flex-col items-center">
                        <span class="text-slate-400 text-xs line-through">
                          R$ {{ L.preço1 }}
                        </span>
                        <span class="text-green-600 text-2xl font-extrabold">
                          R$ {{ L.preço2 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent class="bg-[#111] text-slate-900 md:w-200 w-[100%] md:h-150 h-[100%]">

                  <div>
                    <div class="flex justify-between absolute left-3 top-10">
                      <Button class="bg-[#fc0101] rounded-[20px] text-[16px] text-white font-light">
                        IMPERDÍVEL
                      </Button>
                    </div>

                    <div class="bg-white flex justify-center items-center h-70">
                      <img class="w-50" :src="L.img" alt="">
                    </div>

                    <div class="bg-[#111] px-10 py-5">
                      <div class="flex flex-col">

                        <h2 class="text-[#f0f0f0] font-medium text-[25px]">
                          {{ L.nome }}
                        </h2>

                        <h3 class="text-[50px] text-white font-semibold">
                          R$ {{ L.preço2 }}
                        </h3>

                        <div>
                          <Button class="text-[#888] bg-[#1e1e1e] rounded-[20px] p-2 border">
                            {{ L.tipo }}
                          </Button>
                        </div>

                        <div class="mt-5 border-t border-[#222]"></div>

                        <div class="flex justify-center gap-3 mt-6">

                          <div class="flex gap-2">
                            <button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-2 w-10 border"
                              @click="diminuir(L.id)">-</button>

                            <Button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-7 border">
                              {{ L.quantidade }}
                            </Button>

                            <button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-2 w-10 border"
                              @click="aumentar(L.id)">+</button>
                          </div>

                          <Button 
                            @click="adicionarCarrinho(L, L.quantidade)"
                            class="bg-[#cc1e1e] text-white p-7 font-bold text-[16px]"
                          >
                            Adicionar ao carrinho 
                            <span><ShoppingBasket/></span>
                          </Button>

                        </div>

                      </div>
                    </div>
                  </div>

                </DialogContent>

              </Dialog>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- PAGINAÇÃO FINAL -->
  <div class="flex justify-center gap-2 m-10 flex-wrap">
    <button @click="PaginaAtual > 1 && PaginaAtual--" class="px-3 py-1 bg-red-500 rounded">
      Anterior
    </button>

    <button
      v-for="page in totalPaginas"
      :key="page"
      @click="irParaPagina(page)"
      :class="[
        'px-3 py-1 rounded',
        page === PaginaAtual ? 'bg-red-500 text-white' : 'bg-red-400'
      ]"
    >
      {{ page }}
    </button>

    <button @click="PaginaAtual < totalPaginas && PaginaAtual++" class="px-3 py-1 bg-red-500 rounded">
      Próximo
    </button>
  </div>

  <Footer/>
</div>
</template>