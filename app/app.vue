<script setup lang="ts">
// Canonical + og:url por página. Sem isso, TODA página (inclusive as de
// categoria) declarava a home como canônica — o Google entende isso como
// "não indexe esta página, indexe a outra", derrubando a visibilidade de
// /Alimentos, /Bebidas etc. Fica aqui (não em cada página) porque precisa
// de exatamente uma fonte de verdade, senão o unhead registra duas tags
// <link rel="canonical"> e a duplicata confunde o rastreador.
const SITE_URL = 'https://alopara.com'
const route = useRoute()

useHead({
  link: [
    { rel: 'canonical', href: () => `${SITE_URL}${route.path}` },
  ],
})

useSeoMeta({
  ogUrl: () => `${SITE_URL}${route.path}`,
})

// Dados estruturados (Schema.org) — é o que permite o Google mostrar o
// Alô Pará com nome, telefone e link de forma rica na busca ("rich result"),
// além de alimentar o painel de negócio local quando a busca é por nome.
// Endereço e horário de funcionamento ainda não foram confirmados pelo
// cliente — adicionar em `address` e `openingHoursSpecification` assim que
// vierem (ver conversa). Sem eles o schema ainda é válido, só não concorre
// ao "pacote local" do Google com força total.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
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
      }),
    },
  ],
})
</script>

<template>
  <NuxtPage />
  <Toaster position="bottom-right" rich-colors close-button />
</template>
