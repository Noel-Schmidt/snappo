<template>
  <hero-section />

  <section class="border-border bg-muted/40 text-foreground border-y py-16 sm:py-20">
    <div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
      <div>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Practical tools for everyday development
        </h2>
      </div>
      <div class="text-muted-foreground space-y-5 leading-7">
        <p>
          Snappo brings common developer utilities together in one place: format and validate JSON,
          test regular expressions, preview cron schedules, generate passwords, and inspect color
          values without installing another app.
        </p>
        <p>
          Many tools run directly in your browser. Each tool page explains how its input is handled,
          so you can check before working with sensitive data.
        </p>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          <NuxtLink to="/tools/json-tool" class="text-foreground underline underline-offset-4">
            JSON formatter
          </NuxtLink>
          <NuxtLink to="/tools/regex-tester" class="text-foreground underline underline-offset-4">
            Regex tester
          </NuxtLink>
          <NuxtLink
            to="/tools/password-generator"
            class="text-foreground underline underline-offset-4"
          >
            Password generator
          </NuxtLink>
          <NuxtLink to="/tools" class="text-foreground underline underline-offset-4">
            All developer tools
          </NuxtLink>
          <NuxtLink to="/blog" class="text-foreground underline underline-offset-4">
            Developer blog
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <features-section />

  <latest-blog-posts />

  <contribution-section />

  <faq-section />
</template>
<script setup lang="ts">
import ContributionSection from '~/components/home/contributionSection.vue'
import FaqSection from '~/components/home/faqSection.vue'
import FeaturesSection from '~/components/home/featuresSection.vue'
import HeroSection from '~/components/home/heroSection.vue'
import LatestBlogPosts from '~/components/home/latestBlogPosts.vue'

useSeoConfig({
  title: 'Developer tools',
  url: 'https://snappo.me',
  description:
    'Snappo includes tools for formatting JSON, comparing text, testing regular expressions, generating passwords, and working with colors.',
  headline: 'Developer tools',
})
</script>
