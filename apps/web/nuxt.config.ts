import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    devtools: { enabled: true },

    app: {
        head: {
            htmlAttrs: {
                class: 'dark'
            }
        }
    },

    css: ['~/assets/css/tailwind.css'],

    vite: {
        plugins: [
            tailwindcss(),
            tsconfigPaths()
        ],
    },

    shadcn: {
        prefix: '',
        componentDir: './app/components/ui'
    },

    modules: ['shadcn-nuxt'],
})