<template>
  <about-header />

  <about-story />

  <about-security />

  <home-contribution-section />
</template>
<script setup lang="ts">
import AboutSecurity from '~/components/about/aboutSecurity.vue'

useSeoConfig({
  title: 'About',
  url: 'https://snappo.me/about',
  description:
    'Learn more about Snappo — the free online developer toolbox. Discover our mission, team, and why we built a hub for essential utilities like hash generators, color pickers, text converters, and more.',
  headline: 'About',
})
</script>
