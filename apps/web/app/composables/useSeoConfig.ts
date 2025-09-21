import { defineOgImageComponent } from '#og-image/app/composables/defineOgImageComponent'

export function useSeoConfig(opts: {
  title: string
  site?: string
  url: string
  description: string
  headline: string
}) {
  const site = opts.site ?? 'Snappo'
  const fullTitle = opts.title === site ? site : `${opts.title} | ${site}`

  useSeoMeta({
    title: fullTitle,
    description: opts.description,
    ogTitle: fullTitle,
    ogDescription: opts.description,
    ogUrl: opts.url,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  })

  defineOgImageComponent('Pergel', {
    headline: opts.headline,
    title: opts.title,
    description: opts.description,
  })
}
