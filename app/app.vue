<script setup lang="ts">
import { onMounted } from 'vue'
import { capturarCodigoAfiliado } from '~/composables/useAfiliado'

// Canonical + og:url por página. Sem isso, TODA página (inclusive as de
// categoria) declarava a home como canônica — o Google entende isso como
// "não indexe esta página, indexe a outra", derrubando a visibilidade de
// /Alimentos, /Bebidas etc. Fica aqui (não em cada página) porque precisa
// de exatamente uma fonte de verdade, senão o unhead registra duas tags
// <link rel="canonical"> e a duplicata confunde o rastreador.
const SITE_URL = 'https://alopara.com.br'
const route = useRoute()

// Guarda o código de indicação (?ref=CODIGO) assim que o app monta, pra
// reaparecer na mensagem do WhatsApp quando a pessoa finalizar a compra,
// mesmo que ela chegue por outra página que não seja a home.
onMounted(capturarCodigoAfiliado)

useHead({
  link: [
    { rel: 'canonical', href: () => `${SITE_URL}${route.path}` },
  ],
  // Quem pesquisa "quem criou o site alô pará" vinha achando a Mercafácil
  // (provavelmente por causa do widget do Clube de Descontos, que é deles).
  // Isto aqui é o sinal padrão de autoria que o Google entende — não troca a
  // atribuição da hora pra noite, mas é o que existe pra apontar pro criador
  // certo. O nome completo (não só "David S.") também ajuda a busca por nome.
  meta: [
    { name: 'author', content: 'David Santos' },
  ],
})

useSeoMeta({
  ogUrl: () => `${SITE_URL}${route.path}`,
})

// Aplica o tema ANTES do primeiro paint — sem isto a página sempre nasceria
// com o padrão e "piscaria" pro tema escolhido um instante depois. Padrão é
// claro: só fica escuro se a pessoa já tiver escolhido isso antes.
useHead({
  script: [
    {
      innerHTML: `(function(){try{if(localStorage.getItem('alopara-tema')!=='escuro')document.documentElement.classList.add('claro')}catch(e){document.documentElement.classList.add('claro')}})()`,
    },
  ],
})

// Dados estruturados (Schema.org) — é o que permite o Google mostrar o
// Alô Pará com nome, telefone e link de forma rica na busca ("rich result"),
// além de alimentar o painel de negócio local quando a busca é por nome.
// Endereço e horário de funcionamento ainda não foram confirmados pelo
// cliente — adicionar em `address` e `openingHoursSpecification` assim que
// vierem (ver conversa). Sem eles o schema ainda é válido, só não concorre
// ao "pacote local" do Google com força total.
//
// O bloco WebSite (author/creator) é o sinal de autoria do site em si —
// separado do GroceryStore (que descreve o NEGÓCIO) — pra quando alguém
// pesquisa quem desenvolveu o site, não quem é o mercado.
const AUTOR = {
  '@type': 'Person',
  'name': 'David Santos',
  'url': 'https://portfolio-daviddev.vercel.app/',
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'GroceryStore',
            'name': 'Supermercado Alô Pará',
            'alternateName': ['Alô Pará', 'Alo Para'],
            'url': SITE_URL,
            'logo': `${SITE_URL}/favicon.png`,
            'image': `${SITE_URL}/og-image.png`,
            'telephone': '+5594991923141',
            'priceRange': '$$',
            'sameAs': [
              'https://instagram.com/supermercadoalopara',
            ],
          },
          {
            '@type': 'WebSite',
            'name': 'Alô Pará',
            'url': SITE_URL,
            'author': AUTOR,
            'creator': AUTOR,
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <NuxtPage />
  <Toaster position="bottom-right" rich-colors close-button />
</template>
