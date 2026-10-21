<script setup lang="ts">
/**
 * Duas raízes de propósito: a faixa de informações rola junto com a página e
 * só o <header> fica fixo — e, pro `sticky` valer na página inteira, ele
 * precisa ser filho direto do contêiner da página (não de um <div> que só
 * tem a altura do próprio header).
 */
import { ArrowUpRight, Clock, MapPin, MessageCircle, Moon, ShoppingCart, Sun } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import logo from '~/assets/img/web/logo.webp'
import BuscaGlobal from '~/components/Layout/BuscaGlobal.vue'
import { formatarReais } from '~/composables/useFormatacao'
import { CATEGORIAS_LOJA, CONTATO, LINK_ENCARTES, linkWhatsapp } from '~/composables/useNavegacao'
import { useTema } from '~/composables/useTema'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import Mobilemenu from './Mobilemenu.vue'

const { totalItens, valorTotal, carregado } = useCarrinho()
const { tema, alternar } = useTema()

const quantidade = computed(() => (carregado.value ? Number(totalItens.value.total) || 0 : 0))
const rotuloCarrinho = computed(() => quantidade.value
  ? `Carrinho: ${quantidade.value} ${quantidade.value === 1 ? 'item' : 'itens'}, R$ ${formatarReais(valorTotal.value)}`
  : 'Carrinho vazio')

// ═════════════ AO ROLAR ═════════════
// Sombra quando a página rola; no celular o header some rolando pra baixo e
// volta rolando pra cima (com busca + categorias ele passa de 170px — fixo o
// tempo todo, comeria um quarto da tela). A parte visível vira a variável
// --altura-header-visivel, que as outras barras fixas (filtros da categoria)
// usam pra grudar logo abaixo dele.

const header = ref<HTMLElement | null>(null)
const rolou = ref(false)
const escondido = ref(false)
let altura = 0
let ultimoY = 0
let observador: ResizeObserver | null = null

function publicarAltura() {
  document.documentElement.style.setProperty('--altura-header-visivel', `${escondido.value ? 0 : altura}px`)
}

function aoRolar() {
  const y = window.scrollY
  const delta = y - ultimoY
  rolou.value = y > 4
  const antes = escondido.value
  if (window.innerWidth >= 768 || y < altura + 40)
    escondido.value = false
  else if (delta > 8)
    escondido.value = true
  else if (delta < -8)
    escondido.value = false
  if (Math.abs(delta) > 8 || antes !== escondido.value)
    ultimoY = y
  if (antes !== escondido.value)
    publicarAltura()
}

onMounted(() => {
  ultimoY = window.scrollY
  aoRolar()
  window.addEventListener('scroll', aoRolar, { passive: true })
  if (header.value) {
    observador = new ResizeObserver(([entrada]) => {
      altura = Math.round(entrada?.borderBoxSize?.[0]?.blockSize ?? header.value?.offsetHeight ?? 0)
      publicarAltura()
    })
    observador.observe(header.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', aoRolar)
  observador?.disconnect()
  document.documentElement.style.setProperty('--altura-header-visivel', '0px')
})
</script>

<template>
  <!-- ═════ FAIXA DE INFORMAÇÕES (rola com a página) ═════ -->
  <div class="hidden bg-red-600 text-white md:block">
    <div class="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-[12.5px] lg:px-8">
      <div class="flex items-center gap-5 text-white/90">
        <span class="flex items-center gap-1.5"><MapPin :size="14" class="opacity-80" /> {{ CONTATO.cidade }}</span>
        <span class="flex items-center gap-1.5"><Clock :size="14" class="opacity-80" /> {{ CONTATO.horarioCurto }}</span>
      </div>
      <div class="flex items-center gap-5 font-medium">
        <a :href="CONTATO.clube" target="_blank" rel="noopener noreferrer" class="flex items-center gap-0.5 text-white/90 transition hover:text-white">
          Clube de descontos <ArrowUpRight :size="13" />
        </a>
        <NuxtLink to="/Baixar" class="text-white/90 transition hover:text-white">
          Baixe o app
        </NuxtLink>
        <NuxtLink to="/trabalhe-conosco" class="text-white/90 transition hover:text-white">
          Trabalhe conosco
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- ═════ HEADER FIXO ═════ -->
  <header
    ref="header"
    class="sticky top-0 z-50 border-b bg-(--bg-vidro) backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,translate] duration-300"
    :class="[
      rolou ? 'border-(--borda) shadow-(--sombra-2)' : 'border-transparent',
      escondido ? '-translate-y-full' : '',
    ]"
  >
    <div class="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
      <div class="flex h-16 items-center gap-3 md:h-18 md:gap-6">
        <NuxtLink to="/" class="shrink-0 transition-opacity hover:opacity-90" aria-label="Alô Pará — página inicial">
          <img :src="logo" alt="Supermercado Alô Pará" width="560" height="194" class="h-10 w-auto md:h-12">
        </NuxtLink>

        <BuscaGlobal id="busca" class="hidden max-w-2xl flex-1 md:block" />

        <div class="ml-auto flex items-center gap-1.5 md:gap-2">
          <a
            :href="linkWhatsapp()"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden h-11 items-center gap-2.5 rounded-full pl-1.5 pr-3 transition hover:bg-(--bg-elevado) xl:flex"
          >
            <span class="grid h-8 w-8 place-items-center rounded-full bg-[#25D366]/15 text-[#1a9e4f]">
              <MessageCircle :size="17" />
            </span>
            <span class="leading-tight">
              <span class="block text-[11px] text-(--texto-fraco)">Peça pelo WhatsApp</span>
              <span class="numeros block text-[13px] font-semibold text-(--texto-primario)">{{ CONTATO.whatsappFormatado }}</span>
            </span>
          </a>

          <button
            type="button"
            :aria-label="tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro'"
            :title="tema === 'claro' ? 'Modo escuro' : 'Modo claro'"
            class="grid h-11 w-11 place-items-center rounded-full text-(--texto-esmaecido) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
            @click="alternar"
          >
            <component :is="tema === 'claro' ? Moon : Sun" :size="19" />
          </button>

          <NuxtLink
            to="/Carrinho"
            :aria-label="rotuloCarrinho"
            class="relative flex h-11 items-center gap-2 rounded-full bg-red-600 px-3 text-white shadow-sm shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.97] sm:px-4"
          >
            <ShoppingCart :size="19" />
            <span class="numeros hidden text-sm font-bold sm:block">
              {{ quantidade ? `R$ ${formatarReais(valorTotal)}` : 'Carrinho' }}
            </span>
            <span
              v-if="quantidade"
              :key="quantidade"
              class="contador numeros absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-(--texto-primario) px-1 text-[11px] font-bold text-(--bg-pagina) ring-2 ring-(--bg-pagina)"
            >
              {{ quantidade }}
            </span>
          </NuxtLink>

          <div class="md:hidden">
            <Mobilemenu />
          </div>
        </div>
      </div>

      <!-- Busca no celular: linha própria, largura toda -->
      <div class="pb-3 md:hidden">
        <BuscaGlobal id="busca-mobile" />
      </div>
    </div>

    <!-- ═════ CATEGORIAS ═════ -->
    <nav aria-label="Categorias" class="border-t border-(--borda)">
      <div class="trilho mx-auto flex h-12 max-w-7xl items-center gap-1 overflow-x-auto px-3 md:px-5 lg:px-7">
        <NuxtLink
          v-for="c in CATEGORIAS_LOJA"
          :key="c.rota"
          :to="c.rota"
          class="flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium transition-colors"
          :class="c.rota === '/ofertas'
            ? 'text-red-600 hover:bg-(--marca-suave)'
            : 'text-(--texto-esmaecido) hover:bg-(--bg-elevado) hover:text-(--texto-primario)'"
          active-class="!bg-(--marca-suave) !text-red-600 font-semibold"
        >
          <component :is="c.icone" :size="16" />
          {{ c.label }}
        </NuxtLink>
        <span class="mx-1.5 h-5 w-px shrink-0 bg-(--borda-forte)" aria-hidden="true" />
        <NuxtLink
          :to="LINK_ENCARTES.rota"
          class="flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium text-(--texto-esmaecido) transition-colors hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
          active-class="!bg-(--marca-suave) !text-red-600 font-semibold"
        >
          <component :is="LINK_ENCARTES.icone" :size="16" />
          {{ LINK_ENCARTES.label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.contador { animation: pulo 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes pulo {
  0% { transform: scale(0.6); }
  100% { transform: scale(1); }
}
</style>
