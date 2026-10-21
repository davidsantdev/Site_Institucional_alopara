<script setup lang="ts">
/**
 * Foto do produto. Se não existe foto de verdade (`imagemReal` falso) e o
 * produto tem emoji (hortifruti/açougue — ver emojiProduto.ts), mostra o
 * emoji em 3D no lugar; senão, a foto (ou a imagem padrão de "sem foto"). A
 * foto escolhida pelo admin marca `imagemReal`, então sempre vence o emoji.
 */
import type { Produto } from '~/composables/useCatalogo'
import { ref, watch } from 'vue'
import { imagemEmoji, imagemErro, imgSrc } from '~/composables/useCatalogo'

const props = defineProps<{
  produto: Pick<Produto, 'nome' | 'img' | 'imagemReal' | 'emoji'>
  /** Classes da <img> (tamanho, object-fit...). */
  imgClass?: string
  /** Tamanho do emoji via `text-*` (a imagem 3D mede 1em) — mesma classe que servia pro emoji de texto. */
  emojiClass?: string
}>()

// Emoji sem arquivo 3D (algum novo no emojiProduto.ts que ainda não foi baixado): cai no de texto.
const emojiSemImagem = ref(false)
watch(() => props.produto.emoji, () => {
  emojiSemImagem.value = false
})
</script>

<template>
  <template v-if="produto.emoji && !produto.imagemReal">
    <span
      v-if="emojiSemImagem"
      role="img"
      :aria-label="produto.nome"
      class="select-none leading-none"
      :class="emojiClass"
    >{{ produto.emoji }}</span>
    <img
      v-else
      :src="imagemEmoji(produto.emoji)"
      :alt="produto.nome"
      width="256"
      height="256"
      loading="lazy"
      decoding="async"
      class="h-[1em] w-[1em] select-none object-contain drop-shadow-sm"
      :class="emojiClass"
      @error="emojiSemImagem = true"
    >
  </template>
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
