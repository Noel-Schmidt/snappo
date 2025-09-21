<template>
  <hero-section />

  <features-section />

  <contribution-section />

  <faq-section />
</template>
<script setup lang="ts">
import ContributionSection from '~/components/home/contributionSection.vue'
import FaqSection from '~/components/home/faqSection.vue'
import FeaturesSection from '~/components/home/featuresSection.vue'
import HeroSection from '~/components/home/heroSection.vue'

useSeoConfig({
  title: 'Snappo – Free Developer Tools: Hash Generator, Color Picker and more',
  url: 'https://snappo.me',
  description:
    'Snappo provides free online developer utilities: generate secure hashes, pick and convert colors, transform text cases, test regular expressions, compare diffs, and more — all in one place.',
  headline: 'Developer Toolbox',
})
</script>
