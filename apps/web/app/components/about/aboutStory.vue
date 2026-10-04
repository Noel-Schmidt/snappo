<template>
  <section id="story" class="border-border bg-muted/40 text-foreground border-y py-16 sm:py-20">
    <div class="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div class="max-w-xl">
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Why Snappo exists</h2>
        <p class="text-muted-foreground mt-5 text-base leading-7">
          Snappo started in 2025 as a project by Noel Schmidt. Small development tasks can interrupt
          bigger ones: checking a JSON response, comparing two pieces of text, or converting a
          color. Snappo keeps those utilities together, so they are easy to find when you need them.
        </p>
        <p class="text-muted-foreground mt-4 leading-7">
          The project is open source. Its tools cover code, text, security, color, and CSS, with
          each utility focused on one job.
        </p>
        <NuxtLink
          to="/tools"
          class="text-foreground mt-6 inline-flex text-sm font-medium underline decoration-teal-500 underline-offset-4 transition-colors hover:text-teal-700 dark:hover:text-teal-300"
        >
          Browse the tool collection
        </NuxtLink>
      </div>

      <div class="grid content-start gap-x-8 gap-y-8 sm:grid-cols-2">
        <article v-for="group in toolGroups" :key="group.title">
          <h3 class="text-sm font-semibold text-teal-700 dark:text-teal-300">{{ group.title }}</h3>
          <p class="text-muted-foreground mt-2 text-sm leading-6">{{ group.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const toolGroups = [
  {
    title: 'Code & text',
    description: 'Format JSON, test regular expressions, compare text, and build cron schedules.',
  },
  {
    title: 'Security',
    description: 'Choose password length and character sets, or adjust the bcrypt cost factor.',
  },
  {
    title: 'Color',
    description:
      'Convert color values, build palettes, and check foreground and background contrast.',
  },
  {
    title: 'CSS',
    description: 'Preview border radii and box shadows, then copy the corresponding CSS values.',
  },
]
</script>
