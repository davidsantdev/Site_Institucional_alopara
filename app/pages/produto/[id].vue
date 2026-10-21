<script setup lang="ts">
/**
 * Página de um produto (/produto/<id>-<nome>). Renderiza no servidor (useFetch
 * sem lazy) de propósito: é o que faz o link colado no WhatsApp mostrar foto,
 * nome e preço, e o Google indexar o produto. Produto oculto ou sem estoque
 * responde 404 de verdade (a página mostra o aviso e sai do índice).
 */
import type { Produto } from '~/composables/useCatalogo'
import { Check, ChevronRight, CreditCard, MessageCircle, Minus, PackageX, Plus, ShoppingCart } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import CardProduto from '~/components/Layout/CardProduto.vue'
import Footer from '~/components/Layout/Footer.vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import Preco from '~/components/Layout/Preco.vue'
import { linkProduto, percentualDesconto } from '~/composables/useCatalogo'
import { formatarNome, formatarReais, formatarTipo } from '~/composables/useFormatacao'
import { formatarPeso, PESO, precoUnitario, rotuloQuantidade, subtotalItem, useCarrinho } from '~/data/composable/UseCarrinho'

const SITE_URL = 'https://alopara.com.br'

/** Chave da categoria (vem da API) → nome no caminho da página e pra onde o link leva. */
const CATEGORIAS: Record<string, { titulo: string, rota: string }> = {
  alimentos: { titulo: 'Alimentos', rota: '/alimentos' },
  bebidas: { titulo: 'Bebidas', rota: '/bebidas' },
  limpeza: { titulo: 'Limpeza', rota: '/limpeza' },
  perfumaria: { titulo: 'Perfumaria', rota: '/perfumaria' },
  frutas: { titulo: 'Hortifruti', rota: '/frutas' },
  carnes: { titulo: 'Carnes e frios', rota: '/carnes' },
}

interface RespostaProduto {
  produto: Produto
  categoria: string | null
  similares: Produto[]
}

const route = useRoute()
const { adicionarCarrinho, quantidadeDe, carregado } = useCarrinho()

const { data, error } = await useFetch<RespostaProduto>(`/api/produto/${route.params.id}`, {
  key: `produto-${route.params.id}`,
})

const produto = computed(() => data.value?.produto ?? null)
const similares = computed(() => data.value?.similares ?? [])
const categoria = computed(() => (data.value?.categoria ? CATEGORIAS[data.value.categoria] : null) ?? null)
const nome = computed(() => produto.value ? formatarNome(produto.value.nome) : '')

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

const tituloPagina = computed(() => produto.value ? `${nome.value} | Alô Pará` : 'Produto indisponível | Alô Pará')
const descricaoPagina = computed(() => produto.value
  ? `${nome.value} por R$ ${formatarReais(produto.value.preco2)}${produto.value.pesavel ? ' o quilo' : ''} no Supermercado Alô Pará, em Novo Repartimento - PA. Compre online.`
  : 'Este produto não está disponível no momento no Supermercado Alô Pará.')

/** Foto pro compartilhamento: só a confirmada (a "adivinhada" pode nem existir) — senão a imagem padrão do site. */
const imagemCompartilhamento = computed(() => {
  const img = produto.value?.imagemReal ? produto.value.img : ''
  if (!img)
    return `${SITE_URL}/og-image.jpg`
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
          'name': nome.value,
          'image': imagemCompartilhamento.value,
          'category': formatarTipo(produto.value.tipo),
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
const desconto = computed(() => produto.value?.emPromocao ? percentualDesconto(produto.value.precoOriginal, produto.value.preco2) : 0)
const economia = computed(() => produto.value?.emPromocao ? Number(produto.value.precoOriginal) - Number(produto.value.preco2) : 0)
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
const noCarrinho = computed(() => carregado.value && produto.value ? quantidadeDe(produto.value.nome) : 0)

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
  <div class="flex min-h-screen flex-col bg-(--bg-pagina) font-sans">
    <HeaderMain />

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-10 lg:px-8">
      <template v-if="produto">
        <!-- ═════ CAMINHO ═════ -->
        <nav aria-label="Caminho" class="mb-6 flex flex-wrap items-center gap-1 text-xs text-(--texto-fraco)">
          <NuxtLink to="/" class="transition hover:text-(--texto-primario)">
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
                {{ formatarTipo(produto.tipo) }}
              </NuxtLink>
            </template>
          </template>
          <ChevronRight :size="12" class="opacity-50" />
          <span class="line-clamp-1 font-medium text-(--texto-secundario)" aria-current="page">{{ nome }}</span>
        </nav>

        <!-- ═════ PRODUTO ═════ -->
        <section class="grid gap-6 md:grid-cols-2 md:gap-12">
          <!-- Fundo claro fixo: a foto do produto é sempre em fundo branco, até no tema escuro. -->
          <div class="md:sticky md:top-[calc(var(--altura-header-visivel,0px)+1.5rem)] md:self-start">
            <div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-(--borda) bg-(--bg-foto) p-8 md:p-12">
              <span
                v-if="desconto > 0"
                class="numeros absolute left-4 top-4 rounded-lg bg-red-600 px-2.5 py-1 text-sm font-bold text-white shadow"
              >
                -{{ desconto }}%
              </span>
              <FotoProduto
                :produto="produto"
                img-class="h-full w-full object-contain drop-shadow-md"
                emoji-class="text-[9rem] md:text-[12rem]"
              />
            </div>
          </div>

          <div class="flex flex-col">
            <NuxtLink
              v-if="produto.tipo && categoria"
              :to="{ path: categoria.rota, query: { tipo: produto.tipo } }"
              class="self-start text-xs font-semibold uppercase tracking-wide text-red-600 hover:underline"
            >
              {{ formatarTipo(produto.tipo) }}
            </NuxtLink>
            <h1 class="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-(--texto-primario) md:text-[2.5rem]">
              {{ nome }}
            </h1>

            <div class="mt-6 rounded-3xl border border-(--borda) bg-(--bg-cartao) p-5 shadow-(--sombra-1) md:p-6">
              <div v-if="produto.emPromocao" class="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <span class="rounded-md bg-(--clube-fundo) px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-(--clube)">Preço de clube</span>
                <span class="numeros text-(--texto-fraco)">de <span class="line-through">R$ {{ formatarReais(produto.precoOriginal) }}</span></span>
                <span v-if="economia > 0" class="numeros font-semibold text-(--clube)">economize R$ {{ formatarReais(economia) }}</span>
              </div>
              <Preco :valor="produto.preco2" :por-kg="pesavel" class="text-5xl" />
              <p v-if="pesavel" class="mt-2 text-sm text-(--texto-fraco)">
                Preço por quilo — você escolhe quantas gramas quer.
              </p>

              <!-- Produto pesado: a pessoa escolhe quantas gramas quer (o preço acima é por quilo). -->
              <div v-if="pesavel" class="mt-5">
                <p class="mb-2 text-sm font-semibold text-(--texto-primario)">
                  Quanto você quer?
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="g in OPCOES_GRAMAS"
                    :key="g"
                    type="button"
                    class="numeros h-9 rounded-full border px-3.5 text-sm font-medium transition"
                    :class="gramas === g ? 'border-red-600 bg-red-600 text-white' : 'border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) hover:border-(--borda-hover) hover:text-(--texto-primario)'"
                    @click="ajustarGramas(g)"
                  >
                    {{ formatarPeso(g / 1000) }}
                  </button>
                </div>
              </div>

              <div class="mt-5 flex items-center gap-3">
                <div class="flex h-12 items-center rounded-xl border border-(--borda-forte)">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    class="grid h-12 w-11 place-items-center rounded-l-xl text-(--texto-primario) transition hover:bg-(--bg-elevado)"
                    @click="diminuir"
                  >
                    <Minus :size="17" />
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
                      class="numeros w-16 bg-transparent text-center text-lg font-bold text-(--texto-primario) outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      @change="aoDigitarGramas"
                    >
                    <span class="pr-1 text-sm font-semibold text-(--texto-fraco)">g</span>
                  </label>
                  <span v-else class="numeros min-w-9 text-center text-lg font-bold text-(--texto-primario)">{{ quantidade }}</span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    class="grid h-12 w-11 place-items-center rounded-r-xl text-(--texto-primario) transition hover:bg-(--bg-elevado)"
                    @click="aumentar"
                  >
                    <Plus :size="17" />
                  </button>
                </div>

                <button
                  type="button"
                  class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
                  :class="adicionado ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-red-600 shadow-red-900/20 hover:bg-red-700'"
                  @click="adicionar"
                >
                  <component :is="adicionado ? Check : ShoppingCart" :size="19" />
                  {{ adicionado ? 'Adicionado' : 'Adicionar ao carrinho' }}
                </button>
              </div>

              <!-- Quanto fica o que foi escolhido — mesma conta do carrinho (preço/kg × kg, no centavo). -->
              <p v-if="pesavel" class="mt-3 flex items-baseline gap-1.5 text-sm text-(--texto-fraco)">
                <span class="numeros">{{ formatarPeso(gramas / 1000) }} =</span>
                <Preco :valor="totalEscolhido" class="text-xl" />
              </p>

              <p v-if="noCarrinho > 0" class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-(--bg-elevado) px-4 py-3 text-sm text-(--texto-fraco)">
                <span><strong class="numeros text-(--texto-primario)">{{ rotuloQuantidade({ quantidade: noCarrinho, pesavel }) }}</strong> no seu carrinho</span>
                <NuxtLink to="/Carrinho" class="font-semibold text-red-600 hover:underline">
                  Ver carrinho →
                </NuxtLink>
              </p>
            </div>

            <ul class="mt-6 flex flex-col gap-3.5 text-sm text-(--texto-esmaecido)">
              <li class="flex items-start gap-3">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--bg-cartao) text-(--texto-primario) ring-1 ring-(--borda)">
                  <MessageCircle :size="17" />
                </span>
                <span class="pt-1.5">Monte o carrinho e finalize pelo WhatsApp, direto com a nossa equipe.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--bg-cartao) text-(--texto-primario) ring-1 ring-(--borda)">
                  <CreditCard :size="17" />
                </span>
                <span class="pt-1.5">Pix, cartão de débito e crédito ou dinheiro.</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- ═════ SIMILARES ═════ -->
        <section v-if="similares.length" class="mt-16" aria-labelledby="titulo-similares">
          <div class="mb-5 flex items-end justify-between gap-3">
            <h2 id="titulo-similares" class="text-xl font-bold tracking-tight text-(--texto-primario) md:text-2xl">
              Produtos similares
            </h2>
            <NuxtLink
              v-if="categoria && produto.tipo"
              :to="{ path: categoria.rota, query: { tipo: produto.tipo } }"
              class="flex items-center gap-0.5 rounded-full px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-(--marca-suave)"
            >
              Ver todos
              <ChevronRight :size="16" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            <CardProduto v-for="s in similares" :key="s.id" :produto="s" />
          </div>
        </section>
      </template>

      <!-- ═════ INDISPONÍVEL ═════ -->
      <div v-else class="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
        <span class="grid h-20 w-20 place-items-center rounded-3xl bg-(--bg-elevado) text-(--texto-fraco)">
          <PackageX :size="34" />
        </span>
        <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-(--texto-primario)">
          Produto indisponível
        </h1>
        <p class="mt-2 text-(--texto-fraco)">
          Esse produto não está disponível no momento ou saiu do nosso catálogo. Que tal dar uma olhada nas ofertas?
        </p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <NuxtLink to="/ofertas" class="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
            Ver ofertas
          </NuxtLink>
          <NuxtLink to="/" class="rounded-full border border-(--borda-forte) bg-(--bg-cartao) px-6 py-3 font-semibold text-(--texto-primario) transition hover:border-(--borda-hover)">
            Página inicial
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Celular: preço e botão acompanham a tela enquanto a pessoa rola. -->
    <div
      v-if="produto"
      class="sticky bottom-0 z-40 border-t border-(--borda) bg-(--bg-vidro) px-4 py-3 backdrop-blur-xl md:hidden"
    >
      <div class="flex items-center gap-4">
        <div class="shrink-0">
          <Preco :valor="pesavel ? totalEscolhido : produto.preco2" class="text-2xl" />
          <p class="numeros text-xs text-(--texto-fraco)">
            {{ pesavel ? formatarPeso(gramas / 1000) : (quantidade > 1 ? `${quantidade} unidades` : 'cada') }}
          </p>
        </div>
        <button
          type="button"
          class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl font-semibold text-white shadow-sm transition-all active:scale-[0.98]"
          :class="adicionado ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'"
          @click="adicionar"
        >
          <component :is="adicionado ? Check : ShoppingCart" :size="19" />
          {{ adicionado ? 'Adicionado' : 'Adicionar' }}
        </button>
      </div>
    </div>

    <Footer />
  </div>
</template>
