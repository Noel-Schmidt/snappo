import { defineEventHandler, setResponseHeader } from 'h3'

import { queryCollection, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog').select('path').all()
  const {
    public: { siteUrl = 'https://snappo.me' },
  } = useRuntimeConfig()

  const base = siteUrl.replace(/\/$/, '')
  const urls = posts.map((post) => `<url><loc>${base}${post.path}</loc></url>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return xml
})
