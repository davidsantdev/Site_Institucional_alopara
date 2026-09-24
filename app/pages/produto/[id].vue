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
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { linkProduto, percentualDesconto } from '~/composables/useCatalogo'
import { formatarPeso, PESO, precoUnitario, rotuloQuantidade, subtotalItem, useCarrinho } from '~/data/composable/UseCarrinho'

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
            // Produto pesado: o preço é por quilo — o Google precisa saber disso pra não achar que é por unidade.
            ...(produto.value.pesavel
              ? {
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    'price': produto.value.preco2,
                    'priceCurrency': 'BRL',
                    'referenceQuantity': { '@type': 'QuantitativeValue', 'value': 1, 'unitCode': 'KGM' },
                  },
                }
              : {}),
          },
        }),
      }]
    : [],
})))

// ═════════════ COMPRA ═════════════

/** Atalhos de peso (g) — quem quer outro valor digita no campo de gramas. */
const OPCOES_GRAMAS = [250, 500, 750, 1000, 1500, 2000]

const pesavel = computed(() => Boolean(produto.value?.pesavel))
/** Produto comum: quantas unidades. */
const quantidade = ref(1)
/** Produto pesado: quantas gramas. */
const gramas = ref<number>(PESO.PADRAO_GRAMAS)
const adicionado = ref(false)
let timerAdicionado: ReturnType<typeof setTimeout> | null = null

/** O que vai pro carrinho: unidades, ou kg (500 g = 0.5) no produto pesado. */
const quantidadeEscolhida = computed(() => pesavel.value ? gramas.value / 1000 : quantidade.value)
/** Quanto fica o que a pessoa escolheu (preço/kg × kg, no centavo) — mostrado ao vivo, é o mesmo cálculo do carrinho. */
const totalEscolhido = computed(() => produto.value ? subtotalItem({ ...produto.value, quantidade: quantidadeEscolhida.value }) : 0)

/** Quanto desse produto já está no carrinho (o carrinho é compartilhado e persiste, então isto é sempre verdade). */
const noCarrinho = computed(() => carrinho.value.find((i: any) => i.nome === produto.value?.nome)?.quantidade ?? 0)

/** Arredonda pra 10 g (a balança não mede menos que isso) e segura entre o mínimo e o máximo. */
function ajustarGramas(valor: number) {
  const arredondado = Math.round(valor / 10) * 10
  gramas.value = Math.min(PESO.MAX_GRAMAS, Math.max(PESO.MIN_GRAMAS, arredondado))
}
function aoDigitarGramas(evento: Event) {
  const campo = evento.target as HTMLInputElement
  ajustarGramas(Number(campo.value) || PESO.PADRAO_GRAMAS)
  // Se o valor digitado foi corrigido pra o mesmo que já estava, o Vue não re-renderiza — força o campo.
  campo.value = String(gramas.value)
}
function aumentar() {
  if (pesavel.value)
    ajustarGramas(gramas.value + PESO.PASSO_GRAMAS)
  else
    quantidade.value = Math.min(quantidade.value + 1, 99)
}
function diminuir() {
  if (pesavel.value)
    ajustarGramas(gramas.value - PESO.PASSO_GRAMAS)
  else
    quantidade.value = Math.max(quantidade.value - 1, 1)
}
function adicionar() {
  if (!produto.value)
    return
  adicionarCarrinho(produto.value, quantidadeEscolhida.value)
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
          <div class="relative flex min-h-76 items-center justify-center rounded-3xl border border-(--borda) bg-[#fafafa] p-6 md:min-h-112 md:p-10">
            <span
              v-if="produto.emPromocao"
              class="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow"
            >
              -{{ percentualDesconto(produto.precoOriginal, produto.preco2) }}%
            </span>
            <FotoProduto
              :produto="produto"
              img-class="h-64 w-full object-contain drop-shadow-lg md:h-96"
              emoji-class="text-9xl md:text-[12rem]"
            />
          </div>

          <div class="flex flex-col">
            <span v-if="produto.tipo" class="text-[11px] font-bold uppercase tracking-widest text-red-500">{{ produto.tipo }}</span>
            <h1 class="mt-1 text-2xl font-black leading-tight tracking-tight text-(--texto-primario) md:text-4xl">
              {{ produto.nome }}
            </h1>

            <div class="mt-5">
              <template v-if="produto.emPromocao">
                <p class="text-sm text-(--texto-fraco)">
                  Preço normal: <span class="line-through">R$ {{ produto.precoOriginal }}</span>{{ pesavel ? '/kg' : '' }}
                </p>
                <span class="block text-[11px] font-black uppercase tracking-wide text-emerald-500">Preço do clube</span>
              </template>
              <p class="text-5xl font-extrabold text-(--preco)">
                R$ {{ produto.preco2 }}<span v-if="pesavel" class="ml-1 text-xl font-bold text-(--texto-fraco)">/kg</span>
              </p>
            </div>

            <!-- Produto pesado: a pessoa escolhe quantas gramas quer (o preço acima é por quilo). -->
            <div v-if="pesavel" class="mt-6">
              <p class="mb-2 text-sm font-bold text-(--texto-primario)">
                Quanto você quer?
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="g in OPCOES_GRAMAS"
                  :key="g"
                  type="button"
                  class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
                  :class="gramas === g ? 'border-red-600 bg-red-600 text-white' : 'border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) hover:border-(--borda-hover) hover:text-(--texto-primario)'"
                  @click="ajustarGramas(g)"
                >
                  {{ formatarPeso(g / 1000) }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3" :class="pesavel ? 'mt-4' : 'mt-6'">
              <div class="flex items-center gap-1 rounded-xl border border-(--borda-forte) bg-(--bg-elevado) p-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-(--texto-primario) transition hover:bg-(--borda-forte)"
                  @click="diminuir"
                >
                  −
                </button>
                <label v-if="pesavel" class="flex items-center">
                  <input
                    :value="gramas"
                    type="number"
                    inputmode="numeric"
                    aria-label="Gramas"
                    :min="PESO.MIN_GRAMAS"
                    :max="PESO.MAX_GRAMAS"
                    step="50"
                    class="w-16 bg-transparent text-center text-lg font-bold text-(--texto-primario) outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @change="aoDigitarGramas"
                  >
                  <span class="pr-1 text-sm font-bold text-(--texto-fraco)">g</span>
                </label>
                <span v-else class="min-w-8 text-center text-lg font-bold text-(--texto-primario)">{{ quantidade }}</span>
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

            <!-- Quanto fica o que foi escolhido — mesma conta do carrinho (preço/kg × kg, no centavo). -->
            <p v-if="pesavel" class="mt-3 text-sm text-(--texto-fraco)">
              {{ formatarPeso(gramas / 1000) }} =
              <strong class="text-xl font-extrabold text-(--preco)">R$ {{ totalEscolhido.toFixed(2) }}</strong>
            </p>

            <p v-if="noCarrinho > 0" class="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-(--texto-fraco)">
              <span><strong class="text-(--texto-primario)">{{ rotuloQuantidade({ quantidade: noCarrinho, pesavel }) }}</strong> no seu carrinho</span>
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
