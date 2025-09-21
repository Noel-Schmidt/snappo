import type { ToolMeta } from './tool'

declare module 'nuxt/schema' {
  interface AppConfig {
    siteName: string
    siteBaseUrl: string
    defaultOgComponent: string
    tools: ToolMeta[]
  }
}

export {}
