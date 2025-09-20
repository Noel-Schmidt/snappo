import { defineEventHandler, setResponseHeader } from 'h3'
import { useAppConfig, useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
    const { tools = [] } = useAppConfig() as { tools: { slug: string }[] }
    const { public: { siteUrl = 'https://snappo.me' } } = useRuntimeConfig()

    const base = siteUrl.replace(/\/$/, '')
    const urls = tools.map(t =>
        `<url><loc>${base}/tools/${t.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
    ).join('')

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

    setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return xml
})
