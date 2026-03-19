import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  vite: {
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
    '@nuxtjs/robots'
  ],

  sitemap: {
    siteUrl: 'https://alopara.com' // 🔁 troca depois
  },

  robots: {
    rules: [
      { userAgent: '*', allow: '/' }
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
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' },
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

      title: 'Supermercado Alô Pará - Ofertas',

      meta: [
        { charset: 'utf-8' },


        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

  
        { name: 'description', content: 'Confira as melhores ofertas do Supermercado Alô Pará - PA. Promoções atualizadas todos os dias!' },
        { name: 'keywords', content: 'supermercado, ofertas, promoções, Novo Repartimento, Alô Pará, preços baixos, comprar online' },
        { name: 'author', content: 'Supermercado Alô Pará' },
        { name: 'robots', content: 'index, follow' },


        { property: 'og:title', content: 'Ofertas do Supermercado Alô Pará' },
        { property: 'og:description', content: 'Veja as promoções atualizadas e economize de verdade!' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'pt_BR' },
        { property: 'og:url', content: 'https://alopara.com' },
        { property: 'og:image', content: 'https://alopara.com/capa.jpg' },

   
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Ofertas do Alô Pará' },
        { name: 'twitter:description', content: 'Promoções imperdíveis toda semana!' },
        { name: 'twitter:image', content: 'https://alopara.com/capa.jpg' },


        { name: 'google', content: 'notranslate' }
      ],

      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },

        { rel: 'canonical', href: 'https://alopara.com' }
      ],

      htmlAttrs: {
        lang: 'pt-BR',
        translate: 'no'
      }
    }
  }

})