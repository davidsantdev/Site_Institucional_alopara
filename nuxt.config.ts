import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    server: {
      allowedHosts: true
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
  ],

  // A URL canônica do site é lida daqui pelo @nuxtjs/sitemap (via nuxt-site-config).
  // Antes estava em `sitemap.siteUrl`, chave que a v7 não reconhece — era ignorada
  // em silêncio e o sitemap saía sem host absoluto.
  site: {
    url: 'https://alopara.com',
    name: 'Alô Pará Supermercado'
  },

  // @nuxtjs/robots v5 usa `groups`, não `rules` (a chave antiga também era ignorada).
  robots: {
    groups: [
      { userAgent: ['*'], allow: ['/'], disallow: ['/api/'] }
    ]
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
  },

  imports: {
    dirs: ['./lib'],
  },

  lucide: {
    namePrefix: 'Icon'
  },

  compatibilityDate: '2024-12-14',

  app: {
    head: {

      title: 'Alô Pará | Você no coração da gente ',

      meta: [
        { charset: 'utf-8' },

        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        {
          name: 'description',
          content: 'Confira as melhores ofertas do Supermercado Alô Pará - PA. Promoções atualizadas todos os dias!'
        },

        {
          name: 'keywords',
          content: 'supermercado, ofertas, promoções, Novo Repartimento, Alô Pará, preços baixos, comprar online'
        },

        {
          name: 'author',
          content: 'Supermercado Alô Pará'
        },

        {
          name: 'robots',
          content: 'index, follow'
        },

        {
          property: 'og:title',
          content: 'Ofertas do Supermercado Alô Pará'
        },

        {
          property: 'og:description',
          content: 'Veja as promoções atualizadas e economize de verdade!'
        },

        {
          property: 'og:type',
          content: 'website'
        },

        {
          property: 'og:locale',
          content: 'pt_BR'
        },

        {
          property: 'og:url',
          content: 'https://alopara.com'
        },

        {
          property: 'og:image',
          content: 'https://alopara.com/capa.jpg'
        },

        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },

        {
          name: 'twitter:title',
          content: 'Ofertas do Alô Pará'
        },

        {
          name: 'twitter:description',
          content: 'Promoções imperdíveis toda semana!'
        },

        {
          name: 'twitter:image',
          content: 'https://alopara.com/capa.jpg'
        },

        {
          name: 'google',
          content: 'notranslate'
        }
      ],

      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png'
        },

        {
          rel: 'canonical',
          href: 'https://alopara.com'
        }
      ],

      htmlAttrs: {
        lang: 'pt-BR',
        translate: 'no'
      }
    }
  }

})