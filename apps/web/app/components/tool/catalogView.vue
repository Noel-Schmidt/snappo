<template>
  <section class="mx-auto max-w-7xl px-6 py-10 sm:py-12" aria-label="Browse developer tools">
    <div class="border-border bg-muted/40 mb-8 rounded-xl border p-3 sm:p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative min-w-0 flex-1">
          <label for="tool-search" class="sr-only">Search tools</label>
          <Search
            class="text-muted-foreground pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="tool-search"
            v-model="searchQuery"
            placeholder="Search by tool or task"
            class="border-input bg-background h-12 rounded-lg pl-10 pr-10 text-base shadow-none focus-visible:ring-2"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-1"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        class="mt-3 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter tools by category"
      >
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="focus-visible:outline-ring rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          :class="
            selectedBadge === category
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-background hover:text-foreground'
          "
          :aria-pressed="selectedBadge === category"
          @click="selectedBadge = category"
        >
          {{ category === 'all' ? 'All tools' : category }}
        </button>
        <button
          v-if="searchQuery || selectedBadge !== 'all'"
          type="button"
          class="text-muted-foreground hover:text-foreground ml-auto px-2 py-2 text-sm underline underline-offset-4"
          @click="resetFilters"
        >
          Clear filters
        </button>
      </div>
    </div>

    <div v-if="filteredTools.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="tool in filteredTools"
        :key="tool.slug"
        :to="tool.href"
        class="border-border bg-card hover:border-input hover:bg-accent focus-visible:outline-ring group flex min-h-48 flex-col rounded-xl border p-5 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <div class="flex items-start gap-4">
          <span
            class="tool-icon border-border bg-background text-primary grid h-11 w-11 shrink-0 place-items-center rounded-lg border transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:border-teal-300/60 group-hover:bg-teal-400 group-hover:text-neutral-950"
            aria-hidden="true"
          >
            <component :is="tool.icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0 pt-0.5">
            <p class="mb-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
              {{ tool.badge || 'General' }}
            </p>
            <h2 class="text-card-foreground font-medium">{{ tool.name }}</h2>
            <p class="text-muted-foreground mt-2 line-clamp-3 text-sm leading-6">
              {{ tool.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      v-else
      class="border-border bg-card rounded-xl border px-6 py-14 text-center"
      role="status"
    >
      <h2 class="font-medium">No matching tools</h2>
      <p class="text-muted-foreground mt-2 text-sm">
        Try a different search term or choose another category.
      </p>
      <button
        type="button"
        class="text-foreground mt-4 text-sm font-medium underline underline-offset-4"
        @click="resetFilters"
      >
        Clear filters
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Braces,
  Clock,
  CalendarClock,
  FileCode,
  FileText,
  Hash,
  Key,
  Link,
  Palette,
  Regex,
  Search,
  X,
} from 'lucide-vue-next'
import { computed, ref, type Component } from 'vue'

import { useAppConfig } from '#imports'
import { Input } from '@/components/ui/input'
import type { ToolMeta } from '~/types/tool'

const icons: Record<string, Component> = {
  'bcrypt-generator': Hash,
  'case-converter': FileText,
  'color-picker': Palette,
  'lorem-ipsum-generator': FileText,
  'regex-tester': Regex,
  'diff-checker': FileCode,
  'palette-generator': Palette,
  minifier: FileCode,
  'password-generator': Key,
  'cron-tool': Clock,
  'uuid-tool': Hash,
  'border-radius-generator': Palette,
  'json-tool': Braces,
  'color-contrast-checker': Palette,
  'box-shadow-generator': Palette,
  'url-encoder': Link,
  'timestamp-converter': CalendarClock,
  'base64-tool': FileCode,
  'html-entities': FileCode,
  'number-base-converter': Hash,
  'csv-to-json': Braces,
  'markdown-table-generator': FileText,
  'hmac-generator': Key,
}

const appConfig = useAppConfig() as { tools?: ToolMeta[] }
const searchQuery = ref('')
const selectedBadge = ref('all')
const tools = computed(() =>
  (appConfig.tools ?? []).map((entry) => ({
    name: entry.title,
    slug: entry.slug,
    description: entry.description,
    href: `/tools/${entry.slug}`,
    badge: entry.badge,
    tags: entry.tags ?? [],
    icon: icons[entry.slug] ?? FileCode,
  }))
)

const badgeOptions = computed(() =>
  [
    ...new Set(
      tools.value.map((tool) => tool.badge).filter((badge): badge is string => Boolean(badge))
    ),
  ].sort()
)
const categories = computed(() => ['all', ...badgeOptions.value])

const filteredTools = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return tools.value.filter((tool) => {
    const matchesCategory = selectedBadge.value === 'all' || tool.badge === selectedBadge.value
    const matchesSearch =
      !query ||
      `${tool.name} ${tool.description} ${tool.badge ?? ''} ${tool.tags.join(' ')}`
        .toLowerCase()
        .includes(query)

    return matchesCategory && matchesSearch
  })
})

function resetFilters() {
  searchQuery.value = ''
  selectedBadge.value = 'all'
}
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .tool-icon {
    transition: none;
  }
}
</style>
