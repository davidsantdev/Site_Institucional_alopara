<script setup lang="ts">
/**
 * Página de um produto (/produto/<id>-<nome>). Renderiza no servidor (useFetch
 * sem lazy) de propósito: é o que faz o link colado no WhatsApp mostrar foto,
 * nome e preço, e o Google indexar o produto. Produto oculto ou sem estoque
 * responde 404 de verdade (a página mostra o aviso e sai do índice).
 */
import type { Produto } from '~/composables/useCatalogo'
import { Check, ChevronRight, Home, PackageX, ShoppingCart } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import CardProduto from '~/components/Layout/CardProduto.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { imagemErro, imgSrc, linkProduto, percentualDesconto } from '~/composables/useCatalogo'
import { precoUnitario, useCarrinho } from '~/data/composable/UseCarrinho'

const SITE_URL = 'https://alopara.com.br'

/** Chave da categoria (vem da API) → nome no caminho da página e pra onde o link leva. */
const CATEGORIAS: Record<string, { titulo: string, rota: string }> = {
  alimentos: { titulo: 'Alimentos', rota: '/alimentos' },
  bebidas: { titulo: 'Bebidas', rota: '/bebidas' },
  limpeza: { titulo: 'Limpeza', rota: '/limpeza' },
  perfumaria: { titulo: 'Perfumaria', rota: '/perfumaria' },
  frutas: { titulo: 'Frutas & Verduras', rota: '/frutas' },
}

interface RespostaProduto {
  produto: Produto
  categoria: string | null
  similares: Produto[]
}

const route = useRoute()
const { carrinho, adicionarCarrinho } = useCarrinho()

const { data, error } = await useFetch<RespostaProduto>(`/api/produto/${route.params.id}`, {
  key: `produto-${route.params.id}`,
})

const produto = computed(() => data.value?.produto ?? null)
const similares = computed(() => data.value?.similares ?? [])
const categoria = computed(() => (data.value?.categoria ? CATEGORIAS[data.value.categoria] : null) ?? null)

// ═════════════ URL CANÔNICA / STATUS ═════════════

if (produto.value) {
  // /produto/2400 (sem o nome) e /produto/2400-nome-errado vão pra URL certa — uma página, uma URL.
  const certa = linkProduto(produto.value)
  if (route.path !== certa)
    await navigateTo(certa, { replace: true, redirectCode: 301 })
}
else if (import.meta.server) {
  const event = useRequestEvent()
  if (event && error.value?.statusCode === 404)
    setResponseStatus(event, 404, 'Produto indisponível')
}

// ═════════════ SEO ═════════════

const tituloPagina = computed(() => produto.value ? `${produto.value.nome.trim()} | Alô Pará` : 'Produto indisponível | Alô Pará')
const descricaoPagina = computed(() => produto.value
  ? `${produto.value.nome.trim()} por R$ ${produto.value.preco2} no Supermercado Alô Pará, em Novo Repartimento - PA. Compre online.`
  : 'Este produto não está disponível no momento no Supermercado Alô Pará.')

/** Foto pro compartilhamento: só a confirmada (a "adivinhada" pode nem existir) — senão a imagem padrão do site. */
const imagemCompartilhamento = computed(() => {
  const img = produto.value?.imagemReal ? produto.value.img : ''
  if (!img)
    return `${SITE_URL}/og-image.png`
  return img.startsWith('/') ? `${SITE_URL}${img}` : img
})

useSeoMeta({
  title: tituloPagina,
  description: descricaoPagina,
  ogTitle: tituloPagina,
  ogDescription: descricaoPagina,
  ogImage: imagemCompartilhamento,
  robots: () => produto.value ? 'index, follow' : 'noindex, follow',
})

// Dados estruturados de produto — é o que deixa o Google mostrar preço/disponibilidade na busca.
useHead(computed(() => ({
  script: produto.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': produto.value.nome.trim(),
          'image': imagemCompartilhamento.value,
          'category': produto.value.tipo,
          'offers': {
            '@type': 'Offer',
            'url': `${SITE_URL}${linkProduto(produto.value)}`,
            'priceCurrency': 'BRL',
            'price': produto.value.preco2,
            'availability': 'https://schema.org/InStock',
          },
        }),
      }]
    : [],
})))

// ═════════════ COMPRA ═════════════

const quantidade = ref(1)
const adicionado = ref(false)
let timerAdicionado: ReturnType<typeof setTimeout> | null = null

/** Quanto desse produto já está no carrinho (o carrinho é compartilhado e persiste, então isto é sempre verdade). */
const noCarrinho = computed(() => carrinho.value.find((i: any) => i.nome === produto.value?.nome)?.quantidade ?? 0)

function aumentar() {
  quantidade.value = Math.min(quantidade.value + 1, 99)
}
function diminuir() {
  quantidade.value = Math.max(quantidade.value - 1, 1)
}
function adicionar() {
  if (!produto.value)
    return
  adicionarCarrinho(produto.value, quantidade.value)
  adicionado.value = true
  if (timerAdicionado)
    clearTimeout(timerAdicionado)
  timerAdicionado = setTimeout(() => {
    adicionado.value = false
  }, 1800)
}

onMounted(() => {
  if (!produto.value)
    return
  // Funil do GA4: view_item → add_to_cart → begin_checkout.
  const { gtag } = useGtag()
  gtag('event', 'view_item', {
    currency: 'BRL',
    value: precoUnitario(produto.value),
    items: [{
      item_id: String(produto.value.id),
      item_name: produto.value.nome,
      item_category: produto.value.tipo,
      price: precoUnitario(produto.value),
      quantity: 1,
    }],
  })
})
</script>

<template>
  <div class="min-h-screen bg-(--bg-pagina) flex flex-col font-sans">
    <HeaderMain />

    <main class="mx-auto w-full max-w-7xl flex-1 px-3 py-6 md:px-6 md:py-10">
      <template v-if="produto">
        <!-- ═════ CAMINHO ═════ -->
        <nav aria-label="Caminho" class="mb-5 flex flex-wrap items-center gap-1 text-xs text-(--texto-fraco)">
          <NuxtLink to="/" class="flex items-center gap-1 transition hover:text-(--texto-primario)">
            <Home :size="13" />
            Início
          </NuxtLink>
          <template v-if="categoria">
            <ChevronRight :size="12" class="opacity-50" />
            <NuxtLink :to="categoria.rota" class="transition hover:text-(--texto-primario)">
              {{ categoria.titulo }}
            </NuxtLink>
            <template v-if="produto.tipo">
              <ChevronRight :size="12" class="opacity-50" />
              <NuxtLink :to="{ path: categoria.rota, query: { tipo: produto.tipo } }" class="transition hover:text-(--texto-primario)">
                {{ produto.tipo }}
              </NuxtLink>
            </template>
          </template>
          <ChevronRight :size="12" class="opacity-50" />
          <span class="line-clamp-1 font-semibold text-(--texto-secundario)" aria-current="page">{{ produto.nome }}</span>
        </nav>

        <!-- ═════ PRODUTO ═════ -->
        <section class="grid gap-6 md:grid-cols-2 md:gap-10">
          <!-- Fundo claro fixo: a foto do produto é sempre em fundo branco, até no tema escuro. -->
          <div class="relative flex items-center justify-center rounded-3xl border border-(--borda) bg-[#fafafa] p-6 md:p-10">
            <span
              v-if="produto.emPromocao"
              class="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow"
            >
              -{{ percentualDesconto(produto.precoOriginal, produto.preco2) }}%
            </span>
            <img
              :src="imgSrc(produto.img)"
              :alt="produto.nome"
              width="420"
              height="420"
              class="h-64 w-full object-contain drop-shadow-lg md:h-96"
              @error="imagemErro"
            >
          </div>

          <div class="flex flex-col">
            <span v-if="produto.tipo" class="text-[11px] font-bold uppercase tracking-widest text-red-500">{{ produto.tipo }}</span>
            <h1 class="mt-1 text-2xl font-black leading-tight tracking-tight text-(--texto-primario) md:text-4xl">
              {{ produto.nome }}
            </h1>

            <div class="mt-5">
              <template v-if="produto.emPromocao">
                <p class="text-sm text-(--texto-fraco)">
                  Preço normal: <span class="line-through">R$ {{ produto.precoOriginal }}</span>
                </p>
                <span class="block text-[11px] font-black uppercase tracking-wide text-emerald-500">Preço do clube</span>
              </template>
              <p class="text-5xl font-extrabold text-(--preco)">
                R$ {{ produto.preco2 }}
              </p>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <div class="flex items-center gap-1 rounded-xl border border-(--borda-forte) bg-(--bg-elevado) p-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-(--texto-primario) transition hover:bg-(--borda-forte)"
                  @click="diminuir"
                >
                  −
                </button>
                <span class="min-w-8 text-center text-lg font-bold text-(--texto-primario)">{{ quantidade }}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-(--texto-primario) transition hover:bg-(--borda-forte)"
                  @click="aumentar"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all active:scale-95 md:max-w-xs"
                :class="adicionado ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-red-600 shadow-red-900/30 hover:bg-red-700'"
                @click="adicionar"
              >
                <component :is="adicionado ? Check : ShoppingCart" :size="18" />
                {{ adicionado ? 'Adicionado' : 'Adicionar ao carrinho' }}
              </button>
            </div>

            <p v-if="noCarrinho > 0" class="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-(--texto-fraco)">
              <span><strong class="text-(--texto-primario)">{{ noCarrinho }}</strong> no seu carrinho</span>
              <NuxtLink to="/Carrinho" class="font-bold text-red-500 hover:underline">
                Ver carrinho →
              </NuxtLink>
            </p>
          </div>
        </section>

        <!-- ═════ SIMILARES ═════ -->
        <section v-if="similares.length" class="mt-12" aria-label="Produtos similares">
          <div class="mb-4 flex items-end justify-between gap-3">
            <h2 class="text-xl font-black tracking-tight text-(--texto-primario) md:text-2xl">
              Produtos similares
            </h2>
            <NuxtLink
              v-if="categoria && produto.tipo"
              :to="{ path: categoria.rota, query: { tipo: produto.tipo } }"
              class="flex items-center gap-0.5 text-sm font-bold text-red-500 hover:underline"
            >
              ver todos
              <ChevronRight :size="15" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            <CardProduto v-for="s in similares" :key="s.id" :produto="s" />
          </div>
        </section>
      </template>

      <!-- ═════ INDISPONÍVEL ═════ -->
      <div v-else class="flex flex-col items-center py-24 text-center">
        <PackageX :size="56" class="mb-4 text-(--texto-suave) opacity-40" />
        <h1 class="text-2xl font-black text-(--texto-primario)">
          Produto indisponível
        </h1>
        <p class="mt-2 max-w-md text-(--texto-fraco)">
          Esse produto não está disponível no momento ou saiu do nosso catálogo. Que tal dar uma olhada nas ofertas?
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <NuxtLink to="/ofertas" class="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700">
            Ver ofertas
          </NuxtLink>
          <NuxtLink to="/alimentos" class="rounded-xl border border-(--borda-forte) bg-(--bg-cartao) px-6 py-3 font-bold text-(--texto-primario) transition hover:border-(--borda-hover)">
            Continuar comprando
          </NuxtLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
