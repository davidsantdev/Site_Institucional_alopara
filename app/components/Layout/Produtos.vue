<script setup lang="ts">
import { ref } from 'vue'
import Alimentos from './alimentos.vue'
import Vinho from './Vinho.vue'

const Vinh = ref(false)
const Alimen = ref(true)

function promo() {
  Alimen.value = true
  Vinh.value = false
}

function Adega() {
  Alimen.value = false
  Vinh.value = true
}
</script>

<template>
    <div class="bg-slate-50 h-300 select-none ">


        <div class="flex gap-10 ml-[10%]">
             <button
    @click="promo"
    :class="[
      'text-[22px] pb-2 transition-all',
      Alimen
        ? 'border-b-6 border-red-600 text-red-600'
        : 'text-slate-900 hover:text-red-500'
    ]"
  >
    Promoções
  </button>
          <button
    @click="Adega"
    :class="[
      'text-[22px] pb-2 transition-all',
      Vinh
        ? 'border-b-6 border-red-600 text-red-600'
        : 'text-slate-900 hover:text-red-500'
    ]"
  >
    Bebidas
  </button>
        </div>

        <Alimentos v-show="Alimen"/>
        <Vinho v-show="Vinh"></Vinho>
    </div>
</template>

