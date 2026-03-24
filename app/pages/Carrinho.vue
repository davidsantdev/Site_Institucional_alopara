<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import { Frown, Trash2 } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";

const { carrinho, removeItem, totalItens } = useCarrinho()

function comprarWhatsapp() {
  const numero = "5594991923141"

  const mensagem = `
${carrinho.value.map(item => `
Produto: ${item.nome}
Preço: R$ ${item.preço ?? item.preço2}
`).join("\n")}
  `

  const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`

  window.open(url, "_blank")
}
</script>

<template>
<div class="bg-[#F4F4F4] flex flex-col justify-center">
  <HeaderMain/>

  <div class="flex justify-center flex-col items-center">

    <!-- TÍTULO -->
    <div class="flex justify-between w-[60%] items-center">
      <h2 class="text-slate-800 font-bold md:text-[30px] md:p-14 text-[20px] p-3">
        Carrinho
      </h2>
    </div>

    <div class="flex justify-center items-center flex-col w-full">
      <div class="w-[100%]">


        <div class="flex items-center justify-center w-full">
          <h3 v-if="totalItens.vazio"
            class="text-slate-400 text-[50px] font-light flex flex-col items-center">
            Carrinho de compras vazio...
            <Frown :size="70"/>
          </h3>
        </div>

  
        <div class="relative items-center md:w-full flex justify-center  md:1p-10 p-3">

          <div class="flex md:gap-15 gap-1 flex-wrap md:px-4">

            <div v-for="C in carrinho" :key="C.id"
              class="border-[1px] border-slate-300 bg-slate-50 p-1 shadow 
              flex flex-col cursor-pointer md:w-[300px] w-[170px] md:h-[450px] h-75">


              <div class="flex items-center justify-center  h-45">
                <img class="md:w-40 w-25" :src="C.img" alt="">
              </div>

              <div class="px-6">

 
                <div class="justify-between flex">
                  <button 
                    @click="removeItem(C.nome)"
                    class="bg-[#ff0000] leading-none flex gap-1 h-6 w-30 justify-center items-center text-[12px] rounded-[3px] font-semibold">
                    Remover <Trash2/>
                  </button>

                  <button class="bg-green-400 w-[40px] h-[40px] rounded-full opacity-0 pointer-events-none">
                    +
                  </button>
                </div>

                <div class="md:h-25 h-[30%] md:pt-5">
                  <h3 class="md:text-[17px] text-[13px] text-center text-slate-800 font-semibold">
                    {{ C.nome }}
                  </h3>
                </div>

  
                <div class="h-25 flex items-center justify-center flex-col">

                  <h4 v-if="C.preço1" class="text-slate-800 md:text-[16px] text-[11px]">
                    R$
                    <span class="text-slate-500 md:text-[17px] text-[12px] line-through">
                      {{ C.preço1 }}
                    </span>
                  </h4>

                  <h4 class="text-slate-800">
                    <span class="text-slate-900 md:text-[33px] text-[20px] font-semibold">
                      R$ {{ C.preço ?? C.preço2 }}
                    </span>
                  </h4>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>


      <div class="justify-end flex w-[60%] md:mt-10 mt-5">
        <button 
          v-if="totalItens.compra"
          class="bg-[#05ff1a] w-[400px] h-14 text-[20px] rounded-[12px] m-10"
          @click="comprarWhatsapp()">
          Finalizar no Whatsapp
        </button>
      </div>

    </div>
  </div>

  

  <Footer/>
</div>
</template>