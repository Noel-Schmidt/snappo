<template>
  <section
    v-if="posts?.length"
    class="border-border bg-background text-foreground border-y py-16 sm:py-20"
    aria-labelledby="latest-blog-posts"
  >
    <div class="mx-auto max-w-7xl px-6">
      <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div class="max-w-2xl">
          <h2 id="latest-blog-posts" class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Latest from the blog
          </h2>
          <p class="text-muted-foreground mt-3 leading-7">
            Developer guides, security advice, and news about Snappo.
          </p>
        </div>
        <NuxtLink
          to="/blog"
          class="text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          All articles <span aria-hidden="true">↗</span>
        </NuxtLink>
      </div>

      <div class="mt-8 grid gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="post in latestPosts"
          :key="post.path"
          :to="post.path"
          class="border-border bg-card focus-visible:outline-ring hover:bg-muted/40 group flex h-full flex-col rounded-xl border p-6 transition-colors hover:border-teal-700/50 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:border-teal-300/50"
        >
          <p class="text-muted-foreground text-xs font-medium tracking-wide">
            <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
          </p>
          <h3
            class="text-card-foreground mt-4 text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-teal-800 dark:group-hover:text-teal-200"
          >
            {{ post.title }}
          </h3>
          <p class="text-muted-foreground mt-3 flex-1 leading-7">{{ post.description }}</p>
          <span class="text-foreground mt-6 inline-flex items-center gap-2 text-sm font-medium">
            Read article <span aria-hidden="true">↗</span>
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: posts } = await useAsyncData('home-latest-blog-posts', () =>
  queryCollection('blog')
    .order('publishedAt', 'DESC')
    .order('path', 'DESC')
    .select('title', 'description', 'path', 'publishedAt')
    .all()
)

const latestPosts = computed(() => posts.value?.slice(0, 4) ?? [])

function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
</script>
