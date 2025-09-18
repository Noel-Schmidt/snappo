import { defineOgImageComponent } from '#og-image/app/composables/defineOgImageComponent'

export function useToolSeo(entry: {
  slug: string
  title: string
  description: string
  badge?: string
}) {
  const cfg = useAppConfig()
  const site = cfg.siteName

  const base = cfg.siteBaseUrl.replace(/\/+$/, '')
  const full = `${entry.title} | ${site}`
  const url = `${base}/tools/${entry.slug}`

  useSeoMeta({
    title: full,
    description: entry.description,
    ogTitle: full,
    ogDescription: entry.description,
    ogUrl: url,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent(cfg.defaultOgComponent, {
    headline: entry.badge,
    title: entry.title,
    description: entry.description,
  })
}
