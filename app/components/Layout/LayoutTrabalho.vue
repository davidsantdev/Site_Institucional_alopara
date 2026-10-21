<script setup lang="ts">
import { HeartHandshake, Instagram, MessageCircle, TrendingUp, Users } from 'lucide-vue-next'
import equipeImg from '~/assets/img/web/equipe.webp'
import fachadaImg from '~/assets/img/web/fachada.webp'
import { CONTATO } from '~/composables/useNavegacao'
import DialogCurriculo from './dialogCurriculo.vue'

const RH_WHATSAPP = 'https://wa.me/5594992268984'

const diferenciais = [
  { icone: Users, titulo: 'Equipe unida', desc: 'Trabalhamos em time, valorizamos cada pessoa e celebramos conquistas juntos.' },
  { icone: TrendingUp, titulo: 'Crescimento real', desc: 'Valorizamos quem se dedica. Muitos dos nossos líderes começaram no operacional.' },
  { icone: HeartHandshake, titulo: 'Ambiente saudável', desc: 'Respeito, transparência e boa comunicação fazem parte do nosso dia a dia.' },
]
</script>

<template>
  <div class="bg-(--bg-pagina)">
    <!-- ═════ ABERTURA ═════ -->
    <section class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-6 md:py-20 lg:px-8">
      <div>
        <p class="text-sm font-semibold text-red-600">
          Trabalhe conosco
        </p>
        <h1 class="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-(--texto-primario) md:text-6xl">
          Faça parte da <span class="text-red-600">nossa família</span>
        </h1>
        <p class="mt-5 max-w-lg text-lg leading-relaxed text-(--texto-esmaecido)">
          No Alô Pará, acreditamos que nosso maior patrimônio são as pessoas.
          Se você é dedicado e quer crescer profissionalmente, venha com a gente.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <DialogCurriculo />
          <a
            href="#vagas"
            class="inline-flex h-12 items-center rounded-full border border-(--borda-forte) px-6 font-semibold text-(--texto-primario) transition hover:border-(--borda-hover) hover:bg-(--bg-elevado)"
          >
            Onde ver as vagas
          </a>
        </div>
      </div>

      <div class="relative">
        <div class="absolute -inset-3 rotate-2 rounded-3xl bg-red-600/10" aria-hidden="true" />
        <img
          :src="equipeImg"
          alt="Equipe do Supermercado Alô Pará reunida num evento com a comunidade"
          width="1400"
          height="926"
          class="relative w-full rounded-3xl object-cover shadow-(--sombra-3)"
        >
      </div>
    </section>

    <!-- ═════ DIFERENCIAIS ═════ -->
    <section class="border-y border-(--borda) bg-(--bg-cartao)">
      <div class="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
          Por que trabalhar aqui
        </h2>
        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div v-for="d in diferenciais" :key="d.titulo" class="rounded-2xl border border-(--borda) bg-(--bg-pagina) p-6">
            <span class="grid h-12 w-12 place-items-center rounded-2xl bg-(--marca-suave) text-red-600">
              <component :is="d.icone" :size="22" />
            </span>
            <h3 class="mt-5 text-lg font-bold text-(--texto-primario)">
              {{ d.titulo }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-(--texto-fraco)">
              {{ d.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═════ VAGAS ═════ -->
    <section id="vagas" class="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20 lg:px-8">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
          Onde encontrar nossas oportunidades?
        </h2>
        <p class="mt-3 text-(--texto-fraco)">
          As vagas são divulgadas no nosso Instagram e pelo WhatsApp do RH. Fique de olho e candidate-se!
        </p>

        <div class="mt-7 flex flex-col gap-3">
          <a
            :href="CONTATO.instagram"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-4 rounded-2xl border border-(--borda) bg-(--bg-cartao) p-4 transition hover:border-(--borda-forte) hover:shadow-(--sombra-2)"
          >
            <span class="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-fuchsia-600 via-pink-500 to-amber-400 text-white">
              <Instagram :size="20" />
            </span>
            <span>
              <span class="block font-semibold text-(--texto-primario)">Instagram</span>
              <span class="block text-sm text-(--texto-fraco)">{{ CONTATO.instagramUsuario }}</span>
            </span>
          </a>
          <a
            :href="RH_WHATSAPP"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-4 rounded-2xl border border-(--borda) bg-(--bg-cartao) p-4 transition hover:border-(--borda-forte) hover:shadow-(--sombra-2)"
          >
            <span class="grid h-11 w-11 place-items-center rounded-xl bg-[#25D366] text-white">
              <MessageCircle :size="20" />
            </span>
            <span>
              <span class="block font-semibold text-(--texto-primario)">WhatsApp do RH</span>
              <span class="block text-sm text-(--texto-fraco)">Fale direto com o setor de Recursos Humanos</span>
            </span>
          </a>
        </div>
      </div>

      <img
        :src="fachadaImg"
        alt="Fachada do Supermercado Alô Pará"
        width="1400"
        height="805"
        loading="lazy"
        class="hidden w-full rounded-3xl object-cover shadow-(--sombra-2) md:block"
      >
    </section>
  </div>
</template>
