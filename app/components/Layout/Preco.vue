<script setup lang="ts">
/**
 * Preço no formato de etiqueta de mercado: "R$" e centavos menores, reais em
 * destaque. O tamanho vem do `text-*` de quem usa (tudo aqui é em `em`).
 */
import { computed } from 'vue'
import { formatarReais } from '~/composables/useFormatacao'

const props = defineProps<{
  valor: string | number
  porKg?: boolean
}>()

const partes = computed(() => {
  const [reais = '0', centavos = '00'] = formatarReais(props.valor).split(',')
  return { reais, centavos }
})
</script>

<template>
  <span class="numeros inline-flex items-start font-extrabold leading-none tracking-tight text-(--preco)" :aria-label="`R$ ${partes.reais},${partes.centavos}${porKg ? ' por quilo' : ''}`">
    <span aria-hidden="true" class="mr-[0.12em] mt-[0.18em] text-[0.48em] font-bold">R$</span>
    <span aria-hidden="true">{{ partes.reais }}</span>
    <span aria-hidden="true" class="mt-[0.1em] text-[0.55em]">,{{ partes.centavos }}</span>
    <span v-if="porKg" aria-hidden="true" class="ml-[0.15em] self-end text-[0.42em] font-semibold text-(--texto-fraco)">/kg</span>
  </span>
</template>
