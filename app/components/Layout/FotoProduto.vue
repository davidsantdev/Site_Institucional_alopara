<script setup lang="ts">
/**
 * Foto do produto. Se não existe foto de verdade (`imagemReal` falso) e o
 * produto tem emoji (hortifruti — ver emojiProduto.ts), mostra o emoji no
 * lugar; senão, a foto (ou a imagem padrão de "sem foto"). A foto escolhida
 * pelo admin marca `imagemReal`, então sempre vence o emoji.
 */
import type { Produto } from '~/composables/useCatalogo'
import { imagemErro, imgSrc } from '~/composables/useCatalogo'

defineProps<{
  produto: Pick<Produto, 'nome' | 'img' | 'imagemReal' | 'emoji'>
  /** Classes da <img> (tamanho, object-fit...). */
  imgClass?: string
  /** Classes do emoji — é texto, então o tamanho vem do `text-*`. */
  emojiClass?: string
}>()
</script>

<template>
  <span
    v-if="produto.emoji && !produto.imagemReal"
    role="img"
    :aria-label="produto.nome"
    class="select-none leading-none"
    :class="emojiClass"
  >{{ produto.emoji }}</span>
  <img
    v-else
    :src="imgSrc(produto.img)"
    :alt="produto.nome"
    loading="lazy"
    decoding="async"
    :class="imgClass"
    @error="imagemErro"
  >
</template>
