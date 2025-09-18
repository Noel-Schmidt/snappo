<template>
  <page-header
    title="Explore Tools"
    subtitle="Explore Snappo’s free collection of developer utilities. Generate hashes, pick colors, convert text, and more — all in one place"
    badge="All Tools"
  />

  <catalog-view :tools="tools" />
</template>

<script setup lang="ts">
import PageHeader from '~/components/core/pageHeader.vue'
import CatalogView from '~/components/tools/catalogView.vue'

const title = 'Explore Tools'
const site = 'Snappo'
const fullTitle = `${title} | ${site}`
const url = 'https://snappo.dev/tools'
const description =
  'Explore Snappo’s free collection of developer utilities. Generate hashes, pick colors, convert text, and more — try them all in one place.'

useSeoMeta({
  title: fullTitle,
  description,
  ogTitle: fullTitle,
  ogDescription: description,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImageComponent('Pergel', {
  headline: 'All Tools',
  title: title,
  description: description,
})

const tools = [
  {
    name: 'Bcrypt Generator',
    slug: 'bcrypt-generator',
    description:
      'Generate secure bcrypt hashes with adjustable salt rounds and performance feedback.',
    category: 'Security',
    tags: ['hash', 'password', 'encryption'],
    badge: 'Stable',
    accent: 'rgba(16, 185, 129, 0.25)', // emerald glow
  },
  {
    name: 'Color Picker',
    slug: 'color-picker',
    description:
      'Pick, convert, and copy colors in HEX, RGB, HSL, and OKLCH. Includes history and smart suggestions.',
    category: 'Design',
    tags: ['colors', 'converter', 'hex', 'rgba', 'hsl', 'oklch'],
    badge: 'Stable',
    accent: 'rgba(99, 102, 241, 0.25)', // indigo glow
  },
  {
    name: 'Lorem Ipsum Generator',
    slug: 'lorem-ipsum-generator',
    description:
      'Generate filler text with classic, tech, or hacker styles. Supports HTML, headings, and custom seed.',
    category: 'Content',
    tags: ['text', 'generator', 'filler'],
    badge: 'Beta',
    accent: 'rgba(236, 72, 153, 0.25)', // pink glow
  },
  {
    name: 'Case Converter',
    slug: 'case-converter',
    description:
      'Convert text between lower, upper, title, sentence, camel, pascal, snake, kebab, constant, and slug case.',
    category: 'Text',
    tags: ['text', 'convert', 'formatting'],
    badge: 'Stable',
    accent: 'rgba(251, 191, 36, 0.25)', // amber glow
  },
]
</script>
