<script setup lang="ts">
/**
 * O mapa embutido do Google (iframe) saiu daqui: ele carregava ~1 MB de
 * script de terceiros no rodapé de TODA página. No lugar, um cartão com a
 * foto da fachada e um link que abre o mapa/rota no app do celular — é o
 * que a pessoa quer fazer com o mapa de qualquer jeito.
 */
import { BadgePercent, Clock, CreditCard, Headset, Instagram, MapPin, MessageCircle, Navigation, Store } from 'lucide-vue-next'
import fachada from '~/assets/img/web/fachada.webp'
import logo from '~/assets/img/web/logo.webp'
import { CATEGORIAS_LOJA, CONTATO, LINK_ENCARTES, linkWhatsapp } from '~/composables/useNavegacao'
import DialogContato from './DialogContato.vue'
import DialogPoliticaPrivacidade from './DialogPoliticaPrivacidade.vue'
import DialogTermosUso from './DialogTermosUso.vue'

const ANO_ATUAL = new Date().getFullYear()
const ANOS_DE_MERCADO = ANO_ATUAL - 2004
const MAPA = 'https://www.google.com/maps/search/?api=1&query=-4.2520391,-49.9427902'

const vantagens = [
  { icone: MessageCircle, titulo: 'Pedido pelo WhatsApp', texto: 'Monte o carrinho aqui e finalize na conversa' },
  { icone: CreditCard, titulo: 'Pix, cartão ou dinheiro', texto: 'Débito e crédito aceitos' },
  { icone: BadgePercent, titulo: 'Preço de clube', texto: 'Descontos pra quem é do clube' },
  { icone: Store, titulo: 'Duas lojas', texto: 'Matriz e Filial, abertas todos os dias' },
]

const institucional = [
  { label: LINK_ENCARTES.label, rota: LINK_ENCARTES.rota },
  { label: 'Baixe o app', rota: '/Baixar' },
  { label: 'Trabalhe conosco', rota: '/trabalhe-conosco' },
]
</script>

<template>
  <footer class="mt-auto border-t border-(--borda) bg-(--bg-cartao)">
    <!-- ═════ VANTAGENS ═════ -->
    <div class="border-b border-(--borda)">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-7 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:px-8">
        <div v-for="v in vantagens" :key="v.titulo" class="flex items-center gap-3.5">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--marca-suave) text-red-600">
            <component :is="v.icone" :size="20" />
          </span>
          <span>
            <span class="block text-sm font-semibold text-(--texto-primario)">{{ v.titulo }}</span>
            <span class="block text-[13px] text-(--texto-fraco)">{{ v.texto }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ═════ CORPO ═════ -->
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12 md:px-6 lg:px-8">
      <div class="md:col-span-12 lg:col-span-4">
        <img :src="logo" alt="Supermercado Alô Pará" width="560" height="194" class="h-12 w-auto" loading="lazy">
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-(--texto-fraco)">
          Há {{ ANOS_DE_MERCADO }} anos levando qualidade, economia e confiança pra mesa das famílias paraenses.
        </p>
        <div class="mt-5 flex items-center gap-2">
          <a
            :href="CONTATO.instagram"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram do Alô Pará"
            class="grid h-10 w-10 place-items-center rounded-full border border-(--borda-forte) text-(--texto-esmaecido) transition hover:border-red-600 hover:text-red-600"
          >
            <Instagram :size="18" />
          </a>
          <a
            :href="linkWhatsapp()"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp do Alô Pará"
            class="grid h-10 w-10 place-items-center rounded-full border border-(--borda-forte) text-(--texto-esmaecido) transition hover:border-[#25D366] hover:text-[#1a9e4f]"
          >
            <MessageCircle :size="18" />
          </a>
        </div>
      </div>

      <nav aria-label="Categorias" class="md:col-span-4 lg:col-span-2">
        <p class="text-sm font-semibold text-(--texto-primario)">
          Categorias
        </p>
        <ul class="mt-4 flex flex-col gap-2.5">
          <li v-for="c in CATEGORIAS_LOJA" :key="c.rota">
            <NuxtLink :to="c.rota" class="text-sm text-(--texto-fraco) transition hover:text-red-600">
              {{ c.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <nav aria-label="Institucional" class="md:col-span-4 lg:col-span-2">
        <p class="text-sm font-semibold text-(--texto-primario)">
          Alô Pará
        </p>
        <ul class="mt-4 flex flex-col gap-2.5">
          <li v-for="item in institucional" :key="item.rota">
            <NuxtLink :to="item.rota" class="text-sm text-(--texto-fraco) transition hover:text-red-600">
              {{ item.label }}
            </NuxtLink>
          </li>
          <li>
            <a :href="CONTATO.clube" target="_blank" rel="noopener noreferrer" class="text-sm text-(--texto-fraco) transition hover:text-red-600">
              Clube de descontos
            </a>
          </li>
        </ul>
        <p class="mt-7 text-sm font-semibold text-(--texto-primario)">
          Atendimento
        </p>
        <ul class="mt-4 flex flex-col gap-2.5 text-sm text-(--texto-fraco)">
          <li class="flex items-start gap-2">
            <Clock :size="15" class="mt-0.5 shrink-0" />
            <span>Seg a sáb, 7h às 21h<br>Dom, 7h às 12h30</span>
          </li>
          <li>
            <a :href="linkWhatsapp()" target="_blank" rel="noopener noreferrer" class="numeros flex items-center gap-2 transition hover:text-red-600">
              <MessageCircle :size="15" class="shrink-0" />
              {{ CONTATO.whatsappFormatado }}
            </a>
          </li>
          <li>
            <DialogContato>
              <button type="button" class="flex items-center gap-2 text-left transition hover:text-red-600">
                <Headset :size="15" class="shrink-0" />
                Atacado, financeiro, RH e outros setores
              </button>
            </DialogContato>
          </li>
        </ul>
      </nav>

      <!-- Venha nos visitar -->
      <a
        :href="MAPA"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative block min-h-56 overflow-hidden rounded-2xl md:col-span-4"
      >
        <img
          :src="fachada"
          alt="Fachada do Supermercado Alô Pará"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
        <span class="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
        <span class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
          <span>
            <span class="flex items-center gap-1.5 text-xs font-medium text-white/80">
              <MapPin :size="13" /> {{ CONTATO.cidade }}
            </span>
            <span class="mt-1 block text-lg font-bold leading-tight">Venha nos visitar</span>
          </span>
          <span class="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-neutral-900 transition group-hover:bg-red-600 group-hover:text-white">
            <Navigation :size="14" />
            Como chegar
          </span>
        </span>
      </a>
    </div>

    <!-- ═════ BARRA INFERIOR ═════ -->
    <div class="border-t border-(--borda)">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-[13px] text-(--texto-fraco) md:flex-row md:px-6 lg:px-8">
        <p>© {{ ANO_ATUAL }} Supermercado Alô Pará · Todos os direitos reservados</p>
        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <DialogPoliticaPrivacidade />
          <DialogTermosUso />
          <a
            href="https://portfolio-daviddev.vercel.app/"
            target="_blank"
            rel="noopener noreferrer author"
            class="transition-colors hover:text-(--texto-primario)"
          >
            Feito por <span class="font-semibold text-red-600">David Santos</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
