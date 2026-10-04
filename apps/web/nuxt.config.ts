import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  nitro: {
    $production: {
      preset: 'cloudflare-pages',
    },
    prerender: { routes: ['/sitemap-tools.xml', '/sitemap-blog.xml'] },
  },

  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Snappo' },
      ],
    },
  },

  site: {
    url: process.env.NUXT_SITE_URL || 'https://snappo.me',
    name: 'Snappo',
  },

  sitemap: {
    sources: ['/sitemap-tools.xml', '/sitemap-blog.xml'],
  },

  content: {
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
  },

  css: ['~/assets/css/tailwind.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
    storageKey: 'snappo-theme',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  modules: [
    'shadcn-nuxt',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Snappo – Developer Tools',
      short_name: 'Snappo',
      description:
        'Fast, privacy-friendly developer tools for formatting, generating, and converting data.',
      lang: 'en',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#0a0a0a',
      background_color: '#0a0a0a',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/android-chrome-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}'],
      navigateFallback: '/offline.html',
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'font',
          handler: 'CacheFirst',
          options: {
            cacheName: 'snappo-fonts-v1',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'snappo-images-v1',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
  },
})
