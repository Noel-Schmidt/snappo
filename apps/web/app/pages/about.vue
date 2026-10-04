<template>
  <main class="bg-background text-foreground">
    <page-header
      title="About Snappo"
      subtitle="A focused collection of tools for the smaller tasks that come with building software."
    >
      <template #heading>
        A toolbox for the<br /><span class="text-teal-700 dark:text-teal-300"
          >everyday details.</span
        >
      </template>
    </page-header>

    <about-story />

    <about-security />

    <home-contribution-section />
  </main>
</template>

<script setup lang="ts">
import AboutSecurity from '~/components/about/aboutSecurity.vue'
import PageHeader from '~/components/core/pageHeader.vue'

const title = 'About Snappo | Developer Tools'
const description =
  'Meet Snappo, an open-source developer toolbox for JSON formatting, regex testing, text comparison, password generation, color checks, and CSS utilities.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: 'https://snappo.me/about',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

defineOgImage('Pergel', {
  headline: 'About Snappo',
  title: 'A developer toolbox for everyday tasks',
  description,
})
</script>
