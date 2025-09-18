<template>
  <page-header
    title="Explore Tools"
    subtitle="Explore Snappo’s free collection of developer utilities. Generate hashes, pick colors, convert text, and more — all in one place"
    badge="All Tools"
  />

  <catalog-view />
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
</script>
