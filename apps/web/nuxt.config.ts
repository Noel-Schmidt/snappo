import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    devtools: { enabled: true },

    app: {
        head: {
            htmlAttrs: {
                lang: 'en',
                class: 'dark',
            },
            link: [
                { rel: 'icon', type: 'image/png', href: '/favicon.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
            ],
        },
    },

    site: {
        url: process.env.NUXT_SITE_URL || 'http://localhost:3000',
        name: 'Snappo',
    },

    css: ['~/assets/css/tailwind.css'],

    vite: {
        plugins: [tailwindcss()],
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui',
    },

    modules: ['shadcn-nuxt', 'nuxt-og-image'],
})
