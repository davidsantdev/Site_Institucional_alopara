<script setup lang="ts">
import { ArrowLeft, MessageCircle, Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import Preco from '~/components/Layout/Preco.vue'
import { obterCodigoAfiliado } from '~/composables/useAfiliado'
import { linkProduto } from '~/composables/useCatalogo'
import { formatarNome, formatarReais } from '~/composables/useFormatacao'
import { CATEGORIAS_LOJA, CONTATO } from '~/composables/useNavegacao'
import { linhaPedido, PESO, precoUnitario, rotuloQuantidade, subtotalItem, useCarrinho } from '~/data/composable/UseCarrinho'

useSeoMeta({
  title: 'Meu Carrinho | Alô Pará',
  robots: 'noindex, follow',
})

const { carrinho, carregado, removeItem, esvaziarCarrinho, concluirPedido, valorTotal } = useCarrinho()

const MAX_OBSERVACAO = 300
const observacao = ref('')

const totalCarrinho = computed(() => formatarReais(valorTotal.value))
const quantidadeLinhas = computed(() => carrinho.value.length)

function aumentar(item: any) {
  if (item.pesavel)
    item.quantidade = Math.min(Math.round((item.quantidade + PESO.PASSO_GRAMAS / 1000) * 1000) / 1000, PESO.MAX_GRAMAS / 1000)
  else
    item.quantidade = Math.min((item.quantidade ?? 1) + 1, 99)
}
function diminuir(item: any) {
  if (item.pesavel)
    item.quantidade = Math.max(Math.round((item.quantidade - PESO.PASSO_GRAMAS / 1000) * 1000) / 1000, PESO.MIN_GRAMAS / 1000)
  else if ((item.quantidade ?? 1) > 1)
    item.quantidade--
}
/** O botão − / + trava no limite: peso não passa de 20 kg nem cai de 50 g; o resto, de 1 a 99. */
function noMinimo(item: any) {
  return item.pesavel ? item.quantidade <= PESO.MIN_GRAMAS / 1000 : (item.quantidade ?? 1) <= 1
}
function noMaximo(item: any) {
  return item.pesavel ? item.quantidade >= PESO.MAX_GRAMAS / 1000 : (item.quantidade ?? 1) >= 99
}

function comprarWhatsapp() {
  const valorTotalNumero = valorTotal.value
  const quantidadeItens = carrinho.value.length
  const itensGA = carrinho.value.map(item => ({
    item_id: String(item.id ?? item.nome),
    item_name: item.nome,
    price: precoUnitario(item),
    quantity: item.quantidade ?? 1,
  }))

  const { gtag } = useGtag()
  // 'finalizar_whatsapp' é o evento de sempre (mantido pro que já estava
  // configurado no GA4); 'begin_checkout' é o nome padrão que o relatório
  // de Monetização do Analytics reconhece sozinho — sem ele, o valor não
  // aparecia lá mesmo o evento sendo disparado.
  gtag('event', 'finalizar_whatsapp', {
    value: valorTotalNumero,
    currency: 'BRL',
    quantidade_itens: quantidadeItens,
    items: itensGA,
  })
  gtag('event', 'begin_checkout', {
    value: valorTotalNumero,
    currency: 'BRL',
    items: itensGA,
  })

  const itens = carrinho.value
    .map((item, i) => linhaPedido(item, i + 1))
    .join('\n\n')

  // Se a pessoa chegou por um link de indicação, o código vai junto na
  // mensagem — é assim que o atendente sabe que veio de um afiliado, já
  // que o pedido inteiro fecha por aqui, fora de qualquer sistema.
  const codigoAfiliado = obterCodigoAfiliado()
  const nota = observacao.value.trim().slice(0, MAX_OBSERVACAO)

  const mensagem = [
    'Olá, vim pelo site! Gostaria de fazer o seguinte pedido:',
    itens,
    `Total do pedido: R$ ${totalCarrinho.value}`,
    ...(nota ? [`Observações: ${nota}`] : []),
    ...(codigoAfiliado ? [`Código de indicação: ${codigoAfiliado}`] : []),
  ].join('\n\n')

  const conversa = window.open(`https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank')

  // Só zera (e só conta o clique) se a conversa abriu: com o pop-up
  // bloqueado a pessoa ficaria sem carrinho e sem ter mandado pedido nenhum.
  if (conversa) {
    concluirPedido()
    observacao.value = ''
    // Mesmo número do GA4 (evento finalizar_whatsapp acima), mas direto no
    // painel do admin — fogo e esquece, não trava o fluxo se falhar.
    $fetch('/api/whatsapp-clique', { method: 'POST', body: { valorTotal: valorTotalNumero, quantidadeItens } }).catch(() => {})
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-(--bg-pagina)">
    <HeaderMain />

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <!-- ═════ CARREGANDO (o carrinho vem do navegador, depois da página) ═════ -->
      <div v-if="!carregado" class="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div class="flex flex-col gap-3">
          <div class="mb-3 h-9 w-56 animate-pulse rounded-lg bg-(--bg-elevado)" />
          <div v-for="n in 3" :key="n" class="flex gap-4 rounded-2xl border border-(--borda) bg-(--bg-cartao) p-4">
            <div class="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-(--bg-elevado)" />
            <div class="flex-1">
              <div class="h-4 w-3/4 animate-pulse rounded bg-(--bg-elevado)" />
              <div class="mt-3 h-6 w-24 animate-pulse rounded bg-(--bg-elevado)" />
            </div>
          </div>
        </div>
        <div class="h-72 animate-pulse rounded-2xl bg-(--bg-cartao)" />
      </div>

      <!-- ═════ VAZIO ═════ -->
      <div v-else-if="!quantidadeLinhas" class="mx-auto flex max-w-2xl flex-col items-center py-10 text-center md:py-16">
        <span class="grid h-20 w-20 place-items-center rounded-3xl bg-(--marca-suave) text-red-600">
          <ShoppingCart :size="34" />
        </span>
        <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
          Seu carrinho está vazio
        </h1>
        <p class="mt-2 max-w-md text-(--texto-fraco)">
          Escolha os produtos, monte o carrinho e finalize pelo WhatsApp — a gente confirma tudo com você na conversa.
        </p>
        <NuxtLink
          to="/ofertas"
          class="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-7 font-semibold text-white shadow-sm shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.97]"
        >
          Ver ofertas da semana
        </NuxtLink>
        <div class="mt-10 flex flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="c in CATEGORIAS_LOJA.slice(1)"
            :key="c.rota"
            :to="c.rota"
            class="inline-flex items-center gap-2 rounded-full border border-(--borda-forte) bg-(--bg-cartao) px-4 py-2 text-sm font-medium text-(--texto-secundario) transition hover:border-red-600 hover:text-red-600"
          >
            <component :is="c.icone" :size="15" />
            {{ c.label }}
          </NuxtLink>
        </div>
      </div>

      <!-- ═════ CARRINHO ═════ -->
      <div v-else class="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="titulo-carrinho">
          <div class="mb-5 flex items-end justify-between gap-3">
            <div>
              <h1 id="titulo-carrinho" class="text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
                Meu carrinho
              </h1>
              <p class="mt-1 text-sm text-(--texto-fraco)">
                {{ quantidadeLinhas }} {{ quantidadeLinhas === 1 ? 'produto' : 'produtos' }}
              </p>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-(--texto-fraco) transition hover:bg-(--marca-suave) hover:text-red-600"
              @click="esvaziarCarrinho"
            >
              <Trash2 :size="15" />
              Esvaziar
            </button>
          </div>

          <ul class="flex flex-col gap-3">
            <li
              v-for="item in carrinho"
              :key="item.id ?? item.nome"
              class="flex gap-3 rounded-2xl border border-(--borda) bg-(--bg-cartao) p-3 transition-colors hover:border-(--borda-forte) sm:gap-4 sm:p-4"
            >
              <NuxtLink
                :to="item.id ? linkProduto(item) : '#'"
                class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-(--bg-foto) sm:h-24 sm:w-24"
                :aria-label="formatarNome(item.nome)"
              >
                <FotoProduto :produto="item" img-class="h-[85%] w-[85%] object-contain" emoji-class="text-5xl" />
              </NuxtLink>

              <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex items-start justify-between gap-2">
                  <h2 class="line-clamp-2 text-sm font-medium leading-snug text-(--texto-primario) sm:text-[15px]">
                    {{ formatarNome(item.nome) }}
                  </h2>
                  <button
                    type="button"
                    :aria-label="`Remover ${formatarNome(item.nome)} do carrinho`"
                    class="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-(--texto-suave) transition hover:bg-(--marca-suave) hover:text-red-600"
                    @click="removeItem(item.nome)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
                <p class="numeros mt-0.5 text-xs text-(--texto-fraco)">
                  R$ {{ formatarReais(precoUnitario(item)) }}{{ item.pesavel ? ' / kg' : ' cada' }}
                </p>

                <div class="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div class="flex h-10 items-center rounded-xl border border-(--borda-forte)">
                    <button
                      type="button"
                      :aria-label="`Diminuir ${formatarNome(item.nome)}`"
                      class="grid h-10 w-10 place-items-center rounded-l-xl text-(--texto-primario) transition hover:bg-(--bg-elevado) disabled:cursor-not-allowed disabled:opacity-30"
                      :disabled="noMinimo(item)"
                      @click="diminuir(item)"
                    >
                      <Minus :size="15" />
                    </button>
                    <span class="numeros text-center text-sm font-bold text-(--texto-primario)" :class="item.pesavel ? 'min-w-14' : 'min-w-8'">{{ rotuloQuantidade(item) }}</span>
                    <button
                      type="button"
                      :aria-label="`Aumentar ${formatarNome(item.nome)}`"
                      class="grid h-10 w-10 place-items-center rounded-r-xl text-(--texto-primario) transition hover:bg-(--bg-elevado) disabled:cursor-not-allowed disabled:opacity-30"
                      :disabled="noMaximo(item)"
                      @click="aumentar(item)"
                    >
                      <Plus :size="15" />
                    </button>
                  </div>
                  <Preco :valor="subtotalItem(item)" class="text-xl sm:text-2xl" />
                </div>
              </div>
            </li>
          </ul>

          <NuxtLink to="/" class="mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-(--texto-fraco) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)">
            <ArrowLeft :size="16" />
            Continuar comprando
          </NuxtLink>
        </section>

        <!-- ═════ RESUMO ═════ -->
        <aside class="rounded-2xl border border-(--borda) bg-(--bg-cartao) p-5 shadow-(--sombra-1) md:p-6 lg:sticky lg:top-[calc(var(--altura-header-visivel,0px)+1.5rem)]">
          <h2 class="text-lg font-bold text-(--texto-primario)">
            Resumo do pedido
          </h2>

          <dl class="mt-4 flex flex-col gap-2 text-sm">
            <div class="flex justify-between text-(--texto-fraco)">
              <dt>Produtos ({{ quantidadeLinhas }})</dt>
              <dd class="numeros">
                R$ {{ totalCarrinho }}
              </dd>
            </div>
            <div class="flex justify-between border-t border-(--borda) pt-3 text-base font-bold text-(--texto-primario)">
              <dt>Total</dt>
              <dd class="numeros text-(--preco)">
                R$ {{ totalCarrinho }}
              </dd>
            </div>
          </dl>

          <label for="observacao" class="mt-5 block text-sm font-medium text-(--texto-secundario)">
            Observações <span class="font-normal text-(--texto-fraco)">(opcional)</span>
          </label>
          <textarea
            id="observacao"
            v-model="observacao"
            rows="3"
            :maxlength="MAX_OBSERVACAO"
            placeholder="Ex.: se faltar algum item, pode trocar por similar"
            class="mt-2 w-full resize-none rounded-xl border border-(--borda-forte) bg-(--bg-input) px-3.5 py-3 text-sm text-(--texto-primario) outline-none transition placeholder:text-(--texto-suave) focus:border-red-600 focus:ring-4 focus:ring-red-600/12"
          />

          <button
            type="button"
            class="mt-5 hidden h-13 w-full items-center justify-center gap-2 rounded-xl bg-green-700 text-base font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98] lg:flex"
            @click="comprarWhatsapp"
          >
            <MessageCircle :size="20" />
            Finalizar no WhatsApp
          </button>

          <p class="mt-4 flex items-start gap-2 text-xs leading-relaxed text-(--texto-fraco)">
            <ShieldCheck :size="16" class="mt-px shrink-0 text-(--clube)" />
            Nada é cobrado aqui no site: o pedido vai pro nosso WhatsApp e a equipe confirma tudo com você na conversa.
          </p>
        </aside>
      </div>
    </main>

    <!-- Celular: o resumo fica lá embaixo, então o botão de fechar o pedido acompanha a tela. -->
    <div
      v-if="carregado && quantidadeLinhas"
      class="sticky bottom-0 z-40 border-t border-(--borda) bg-(--bg-vidro) px-4 py-3 backdrop-blur-xl lg:hidden"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-4">
        <div class="shrink-0">
          <p class="text-xs text-(--texto-fraco)">
            Total
          </p>
          <Preco :valor="valorTotal" class="text-2xl" />
        </div>
        <button
          type="button"
          class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 font-semibold text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98]"
          @click="comprarWhatsapp"
        >
          <MessageCircle :size="19" />
          Finalizar no WhatsApp
        </button>
      </div>
    </div>

    <Footer />
  </div>
</template>
