<template>
  <section class="bg-background text-foreground py-20 sm:py-28">
    <div class="mx-auto max-w-7xl px-6">
      <div
        class="border-border flex flex-col justify-between gap-7 border-b pb-8 md:flex-row md:items-end"
      >
        <div>
          <h2 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">Tools</h2>
          <p class="text-muted-foreground mt-3 leading-7">
            Tools for JSON, regular expressions, passwords, and color.
          </p>
        </div>
        <div class="flex flex-wrap gap-2" aria-label="Filter tools by category">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            :class="
              activeCategory === category
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            "
            :aria-pressed="activeCategory === category"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="tool in visibleTools"
          :key="tool.title"
          :to="tool.href"
          class="tool-card border-border bg-card hover:border-input hover:bg-accent focus-visible:outline-ring group flex min-h-44 flex-col justify-between rounded-xl border p-5 transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            class="tool-icon border-border bg-background text-primary grid h-10 w-10 place-items-center rounded-lg border transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:border-teal-300/60 group-hover:bg-teal-400 group-hover:text-neutral-950"
          >
            <component :is="tool.icon" class="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span class="mt-7 block">
            <span class="text-card-foreground block font-medium">{{ tool.title }}</span>
            <span class="text-muted-foreground mt-1.5 block text-sm leading-6">{{
              tool.description
            }}</span>
          </span>
        </NuxtLink>
        <p
          v-if="visibleTools.length === 0"
          class="border-border text-muted-foreground rounded-xl border p-6 text-sm"
        >
          No tools in this category yet.
        </p>
      </div>

      <div class="mt-7 flex justify-end">
        <NuxtLink
          to="/tools"
          class="text-sm font-medium text-teal-300 underline decoration-teal-300/40 underline-offset-4 transition-colors hover:text-teal-200"
        >
          Browse all tools
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Braces, Clock, FileCode, Hash, Key, Palette } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const categories = ['All', 'Code', 'Security', 'Design']
const activeCategory = ref('All')
const tools = [
  {
    title: 'JSON tool',
    description: 'Format, validate, and minify JSON.',
    icon: FileCode,
    category: 'Code',
    href: '/tools/json-tool',
  },
  {
    title: 'Regex tester',
    description: 'Test expressions with live highlighting and match groups.',
    icon: Braces,
    category: 'Code',
    href: '/tools/regex-tester',
  },
  {
    title: 'Cron tool',
    description: 'Build cron expressions and preview upcoming run times.',
    icon: Clock,
    category: 'Code',
    href: '/tools/cron-tool',
  },
  {
    title: 'Bcrypt generator',
    description: 'Generate and verify bcrypt hashes.',
    icon: Hash,
    category: 'Security',
    href: '/tools/bcrypt-generator',
  },
  {
    title: 'Password generator',
    description: 'Choose a length and character sets for a password.',
    icon: Key,
    category: 'Security',
    href: '/tools/password-generator',
  },
  {
    title: 'Color picker',
    description: 'Pick, convert, and copy color values.',
    icon: Palette,
    category: 'Design',
    href: '/tools/color-picker',
  },
]

const visibleTools = computed(() =>
  activeCategory.value === 'All'
    ? tools
    : tools.filter((tool) => tool.category === activeCategory.value)
)
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .tool-card,
  .tool-icon {
    transition: none;
  }
}
</style>
