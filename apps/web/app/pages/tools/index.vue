<template>
  <main class="bg-background text-foreground">
    <page-header
      title="Developer tools"
      subtitle="Format JSON, test patterns, compare text, and tune colors. Then get back to building."
    >
      <template #heading>
        Handle the small tasks.<br /><span class="text-teal-700 dark:text-teal-300"
          >Get back to building.</span
        >
      </template>
    </page-header>

    <catalog-view />
  </main>
</template>

<script setup lang="ts">
import PageHeader from '~/components/core/pageHeader.vue'
import CatalogView from '~/components/tool/catalogView.vue'

const title = 'Developer Tools'
const description =
  'Browse Snappo tools for JSON, regular expressions, text, passwords, colors, cron schedules, and more.'
const url = 'https://snappo.me/tools'

useSeoMeta({
  title: `${title} | Snappo`,
  description,
  ogTitle: `${title} | Snappo`,
  ogDescription: description,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImage('Pergel', {
  headline: title,
  title,
  description,
})
</script>
