import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    devtools: { enabled: true },

    css: ['~/assets/css/tailwind.css'],

    vite: {
        plugins: [
            tailwindcss(),
        ],
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui'
    },

    modules: ['shadcn-nuxt'],
})