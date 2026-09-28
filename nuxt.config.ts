import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css', '~/assets/css/tema.css'],

  vite: {
    server: {
      allowedHosts: true,
    },

    plugins: [
      tailwindcss(),
    ],
  },

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    'nuxt-lucide-icons',
    'nuxt-aos',

    // 🔥 SEO
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',

    // Toasts (feedback ao adicionar no carrinho)
    'vue-sonner/nuxt',

    // Analytics — mede visitas, navegação por página e o clique em "Finalizar no WhatsApp".
    'nuxt-gtag',
  ],

  // ID público (não é segredo — todo GA4 expõe o measurement ID no HTML da página).
  // Override via NUXT_PUBLIC_GTAG_ID só se precisar apontar pra outra propriedade
  // (ex.: sandbox de teste) sem mexer no código.
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID ?? 'G-TWY1RG29N2',
  },

  // A URL canônica do site é lida daqui pelo @nuxtjs/sitemap (via nuxt-site-config).
  // Antes estava em `sitemap.siteUrl`, chave que a v7 não reconhece — era ignorada
  // em silêncio e o sitemap saía sem host absoluto.
  site: {
    url: 'https://alopara.com.br',
    name: 'Alô Pará Supermercado',
  },

  // Carrinho é por sessão do usuário (localStorage) — não tem valor de busca
  // e ainda dilui o crawl budget se ficar listado ao lado das páginas reais.
  sitemap: {
    exclude: ['/Carrinho'],
  },

  // @nuxtjs/robots v5 usa `groups`, não `rules` (a chave antiga também era ignorada).
  // /admin e /uploads também ficam fora — a página do admin já manda noindex
  // por conta própria (useSeoMeta), isto aqui é a segunda camada.
  robots: {
    groups: [
      { userAgent: ['*'], allow: ['/'], disallow: ['/api/', '/admin/', '/uploads/'] },
    ],
  },

  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800],
    },
  },

  routeRules: {
    // Páginas estáticas: geradas no build, servidas do CDN sem tocar o servidor.
    '/': { prerender: true },
    '/trabalhe-conosco': { prerender: true },
    '/Baixar': { prerender: true },

    // As rotas de produto definem seu próprio Cache-Control conforme o estado do
    // catálogo (ver server/utils/rotaCategoria.ts) — aqui só garantimos que o
    // Nitro não as prerenderize nem as trate como estáticas.
    '/api/**': { cache: false },

    // Painel de admin: depende de sessão (cookie) — nunca pode ser prerenderizado
    // nem cacheado, ou uma pessoa veria a tela logada de outra.
    '/admin/**': { cache: false, prerender: false },
  },

  imports: {
    dirs: ['./lib'],
  },

  lucide: {
    namePrefix: 'Icon',
  },

  compatibilityDate: '2024-12-14',

  app: {
    head: {
      // Título/descrição/OG por página sobrescrevem isto via useHead/useSeoMeta
      // (dedupe automático pelo unhead — ver app/app.vue e cada página).
      // Cada página já inclui "| Alô Pará" no próprio título, então NÃO usamos
      // titleTemplate aqui — duplicaria o sufixo.
      title: 'Supermercado Alô Pará em Novo Repartimento - PA',

      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        {
          name: 'description',
          content: 'Supermercado Alô Pará em Novo Repartimento - PA. Ofertas atualizadas todos os dias em alimentos, bebidas, limpeza e perfumaria. Compre online.',
        },

        {
          name: 'keywords',
          content: 'supermercado, Alô Pará, alo para, supermercado Novo Repartimento, Novo Repartimento PA, ofertas, promoções, preços baixos, comprar online',
        },

        { name: 'author', content: 'Supermercado Alô Pará' },
        { name: 'robots', content: 'index, follow' },

        // og:title / og:description / og:url ficam a cargo de cada página
        // (useSeoMeta) — só o que é igual em todo lugar mora aqui.
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'pt_BR' },
        { property: 'og:site_name', content: 'Supermercado Alô Pará' },
        { property: 'og:image', content: 'https://alopara.com.br/og-image.png' },
        { property: 'og:image:width', content: '1920' },
        { property: 'og:image:height', content: '1080' },
        { property: 'og:image:alt', content: 'Equipe do Supermercado Alô Pará' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://alopara.com.br/og-image.png' },

        { name: 'google', content: 'notranslate' },
      ],

      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],

      htmlAttrs: {
        lang: 'pt-BR',
        translate: 'no',
      },
    },
  },

})
