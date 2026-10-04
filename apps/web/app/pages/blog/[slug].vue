<template>
  <main v-if="post" class="bg-background text-foreground">
    <PageHeader :title="post.title" :subtitle="post.description" />

    <div class="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" class="mb-8 text-sm">
        <ol class="text-muted-foreground flex flex-wrap items-center gap-2">
          <li><NuxtLink to="/" class="underline underline-offset-4">Home</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><NuxtLink to="/blog" class="underline underline-offset-4">Blog</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li class="text-foreground" aria-current="page">{{ post.title }}</li>
        </ol>
      </nav>

      <article class="max-w-3xl">
        <p class="text-muted-foreground mb-8 text-sm">
          {{ post.category }} <span aria-hidden="true">·</span>
          <time :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
        </p>

        <ContentRenderer :value="post" class="blog-content" />

        <div v-if="post.toolPath && post.toolLabel" class="border-border mt-10 border-t pt-6">
          <NuxtLink
            :to="post.toolPath"
            class="text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Open the {{ post.toolLabel }}
          </NuxtLink>
        </div>

        <nav aria-label="More articles" class="border-border mt-12 border-t pt-6">
          <NuxtLink
            to="/blog"
            class="text-foreground focus-visible:outline-ring inline-flex min-h-11 items-center font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            All articles
          </NuxtLink>
        </nav>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import PageHeader from '~/components/core/pageHeader.vue'

const route = useRoute()
const { data: post } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).first()
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
}

const title = computed(() => post.value?.seo?.title || `${post.value?.title} | Snappo Blog`)
const description = computed(() => post.value?.seo?.description || post.value?.description || '')
const canonicalUrl = computed(() => `https://snappo.me${route.path}`)
const publishedAt = computed(() => post.value?.publishedAt)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonicalUrl,
  ogType: 'article',
  articlePublishedTime: publishedAt,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})

defineOgImage('Pergel', {
  headline: 'Snappo Blog',
  title,
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

<style scoped>
.blog-content :deep(h2) {
  margin-top: 2.5rem;
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.3;
}

.blog-content :deep(h3) {
  margin-top: 2rem;
  color: var(--foreground);
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.blog-content :deep(p),
.blog-content :deep(li) {
  margin-top: 1rem;
  color: var(--muted-foreground);
  line-height: 1.8;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  margin-top: 1rem;
  padding-left: 1.5rem;
  list-style: disc;
}

.blog-content :deep(ol) {
  list-style: decimal;
}

.blog-content :deep(a) {
  color: var(--foreground);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.blog-content :deep(code) {
  border-radius: 0.25rem;
  background: var(--muted);
  padding: 0.125rem 0.35rem;
  color: var(--foreground);
  font-size: 0.9em;
}

.blog-content :deep(pre) {
  overflow-x: auto;
  margin-top: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--muted);
  padding: 1rem;
}

.blog-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.blog-content :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  margin-top: 1.25rem;
  border-collapse: collapse;
}

.blog-content :deep(th),
.blog-content :deep(td) {
  border: 1px solid var(--border);
  padding: 0.65rem 0.8rem;
  text-align: left;
}

.blog-content :deep(th) {
  color: var(--foreground);
  font-weight: 600;
}
</style>
