<template>
  <main class="bg-background text-foreground">
    <PageHeader
      title="Developer Guides and Snappo Updates"
      subtitle="Practical articles for developers, plus news and updates from Snappo."
    >
      <template #heading>
        Developer guides<br /><span class="text-teal-700 dark:text-teal-300"
          >and Snappo updates.</span
        >
      </template>
    </PageHeader>

    <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16" aria-labelledby="latest-posts">
      <div v-if="posts?.length" class="grid gap-5 pt-2 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="post in posts"
          :key="post.path"
          :to="post.path"
          class="border-border bg-card focus-visible:outline-ring hover:bg-muted/40 group flex h-full flex-col rounded-xl border p-6 transition-colors hover:border-teal-700/50 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:border-teal-300/50"
        >
          <p class="text-muted-foreground text-xs font-medium tracking-wide">
            <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
          </p>
          <h3
            class="text-card-foreground mt-5 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-teal-800 dark:group-hover:text-teal-200"
          >
            {{ post.title }}
          </h3>
          <p class="text-muted-foreground mt-3 flex-1 leading-7">{{ post.description }}</p>
          <span class="text-foreground mt-7 inline-flex items-center gap-2 text-sm font-medium">
            Read article <span aria-hidden="true">↗</span>
          </span>
        </NuxtLink>
      </div>
      <p v-else class="text-muted-foreground mt-8">There are no blog posts yet.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { defineOgImage } from '#og-image/app/composables/defineOgImage'
import PageHeader from '~/components/core/pageHeader.vue'

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog')
    .order('publishedAt', 'DESC')
    .order('path', 'DESC')
    .select('title', 'description', 'path', 'publishedAt')
    .all()
)

const title = 'Developer Guides and Snappo Updates | Snappo'
const description =
  'Read practical developer guides on coding and security, including password safety and HMAC, and get product news and updates from Snappo.'
const url = 'https://snappo.me/blog'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({ link: [{ rel: 'canonical', href: url }] })

defineOgImage('Pergel', {
  headline: 'Snappo Blog',
  title: 'Developer guides and Snappo updates',
  description,
})

function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
</script>
