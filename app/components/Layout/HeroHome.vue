<script setup lang="ts">
/**
 * Abertura da home: a foto aérea da fachada lotada num evento com a
 * comunidade — prova social de verdade, não banco de imagem. Texto curto,
 * duas ações (ofertas / WhatsApp) e os números que o site já usava.
 */
import { ArrowRight, MapPin, MessageCircle } from 'lucide-vue-next'
import foto640 from '~/assets/img/web/fachada-evento-640.webp'
import foto1280 from '~/assets/img/web/fachada-evento-1280.webp'
import foto1920 from '~/assets/img/web/fachada-evento-1920.webp'
import { CONTATO, linkWhatsapp } from '~/composables/useNavegacao'

// Calculado (não escrito na mão) pra nunca ficar desatualizado — fundado em 2004.
const ANOS_DE_MERCADO = new Date().getFullYear() - 2004

const numeros = [
  { valor: `+${ANOS_DE_MERCADO}`, rotulo: 'anos de mercado' },
  { valor: '+40 mil', rotulo: 'clientes atendidos' },
  { valor: '2', rotulo: 'lojas na cidade' },
]
</script>

<template>
  <section class="relative isolate overflow-hidden bg-neutral-900">
    <img
      :src="foto1280"
      :srcset="`${foto640} 640w, ${foto1280} 1280w, ${foto1920} 1920w`"
      sizes="100vw"
      alt="Vista aérea da fachada do Supermercado Alô Pará, com a rua tomada por clientes num evento"
      width="1920"
      height="1080"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%]"
    >
    <div class="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/70 to-black/40 md:bg-linear-to-r md:from-black/90 md:via-black/70 md:to-black/15" />

    <div class="mx-auto max-w-7xl px-4 pb-8 pt-9 md:px-6 md:pb-20 md:pt-24 lg:px-8">
      <div class="max-w-2xl text-white">
        <p class="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm sm:inline-flex">
          <MapPin :size="13" />
          Supermercado em {{ CONTATO.cidade }}
        </p>

        <h1 class="text-[2.4rem] font-extrabold leading-[1.02] tracking-tight sm:mt-5 md:text-6xl lg:text-7xl">
          <span class="sr-only">Supermercado Alô Pará: </span>
          Você no coração <span class="text-red-500">da gente.</span>
        </h1>

        <p class="mt-4 max-w-lg text-[15px] leading-relaxed text-white/85 md:mt-5 md:text-lg">
          Ofertas atualizadas todo dia em hortifruti, carnes, mercearia e muito mais.
          Monte seu carrinho aqui e finalize pelo WhatsApp.
        </p>

        <div class="mt-6 flex flex-wrap gap-3 md:mt-8">
          <NuxtLink
            to="/ofertas"
            class="group inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-6 font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 active:scale-[0.97]"
          >
            Ver ofertas da semana
            <ArrowRight :size="18" class="transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
          <a
            :href="linkWhatsapp()"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-6 font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.97]"
          >
            <MessageCircle :size="18" />
            Pedir pelo WhatsApp
          </a>
        </div>

        <dl class="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-5 md:mt-10 md:gap-x-10 md:pt-6">
          <!-- dt antes do dd no HTML (exigência do <dl>); o flex inverte só na tela. -->
          <div v-for="n in numeros" :key="n.rotulo" class="flex flex-col-reverse">
            <dt class="text-xs text-white/65 md:text-sm">
              {{ n.rotulo }}
            </dt>
            <dd class="numeros text-2xl font-bold md:text-3xl">
              {{ n.valor }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
