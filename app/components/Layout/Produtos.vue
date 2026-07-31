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
  <div class="pt-16 pb-4 select-none">
    <!-- abas -->
    <div class="w-full max-w-6xl mx-auto px-4 md:px-6 flex gap-8 border-b border-[#1f1f1f] mb-10">
      <button
        type="button"
        class="pb-4 -mb-px text-[12px] md:text-[13px] font-black tracking-[2px] uppercase border-b-2 transition-colors"
        :class="Alimen ? 'border-red-600 text-white' : 'border-transparent text-[#555] hover:text-[#999]'"
        @click="promo"
      >
        Os melhores produtos
      </button>
      <button
        type="button"
        class="pb-4 -mb-px text-[12px] md:text-[13px] font-black tracking-[2px] uppercase border-b-2 transition-colors"
        :class="Vinh ? 'border-red-600 text-white' : 'border-transparent text-[#555] hover:text-[#999]'"
        @click="Adega"
      >
        Bebidas
      </button>
    </div>

    <Alimentos v-show="Alimen" />
    <Vinho v-show="Vinh" />
  </div>
</template>
