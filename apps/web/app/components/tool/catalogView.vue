<template>
  <tool-layout>
    <h2 class="mb-4 text-2xl font-bold">Explore all Tools</h2>

    <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-end">
      <div class="flex w-full items-center gap-3">
        <div class="relative w-full">
          <Input v-model="searchQuery" placeholder="Search tools…" class="h-10 pl-9" />
          <svg
            class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </div>

        <Select v-model="selectedBadge">
          <SelectTrigger class="h-10 w-36">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent class="bg-neutral-950">
            <SelectItem value="all">All</SelectItem>
            <SelectItem v-for="b in badgeOptions" :key="b" :value="b">{{ b }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="tool in filteredTools"
        :key="tool.slug"
        :to="tool.href"
        class="group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 text-[14px] leading-tight hover:bg-neutral-900"
      >
        <div
          class="pointer-events-none absolute -inset-px opacity-0 blur-[14px] transition-opacity duration-300 group-hover:opacity-100"
          :style="{
            background: `radial-gradient(380px 120px at 12% 0%, ${tool.accent || 'rgba(99,102,241,0.35)'} 0%, transparent 70%)`,
          }"
        />
        <div class="relative grid gap-3">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300"
            >
              <component :is="tool.icon" v-if="tool.icon" class="h-5 w-5" />
              <span v-else class="text-xs font-medium leading-none">
                {{ tool.short || tool.name.slice(0, 2).toUpperCase() }}
              </span>
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-sm font-medium leading-none">{{ tool.name }}</h3>

                <span
                  v-if="tool.status"
                  class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] leading-none"
                  :class="
                    tool.status === 'stable'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                  "
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="tool.status === 'stable' ? 'bg-emerald-400' : 'bg-yellow-400'"
                  />
                  {{ tool.status === 'stable' ? 'Stable' : 'Beta' }}
                </span>
              </div>

              <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-400">
                {{ tool.description }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="tag in tool.tags"
              :key="tag"
              variant="outline"
              class="h-6 rounded-full border-neutral-700 bg-neutral-800/60 px-2 text-[11px] leading-none text-neutral-300"
            >
              {{ tag }}
            </Badge>
          </div>

          <div class="mt-1 flex items-center justify-between text-xs leading-none text-neutral-400">
            <span class="truncate">{{ tool.badge || 'General' }}</span>
            <span class="opacity-70 transition-opacity group-hover:opacity-100">Open →</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      v-if="filteredTools.length === 0"
      class="mt-10 rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center"
    >
      <p class="text-sm leading-normal text-neutral-400">No tools match your query.</p>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useAppConfig } from '#imports'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { ToolMeta } from '~/types/tool'

const appConfig = useAppConfig() as { tools?: ToolMeta[] }
const registry = computed<ToolMeta[]>(() => appConfig.tools ?? [])

const tools = computed<ToolMeta[]>(() =>
  registry.value.map((toolEntry: ToolMeta): any => ({
    name: toolEntry.title,
    slug: toolEntry.slug,
    description: toolEntry.description,
    href: `/tools/${toolEntry.slug}`,
    tags: toolEntry.tags ?? [],
    badge: toolEntry.badge,
    status: toolEntry.status,
    accent: toolEntry.accent,
  }))
)

const searchQuery = ref<string>('')
const selectedBadge = ref<string>('all')

const badgeOptions = computed<string[]>(() => {
  const set = new Set<string>()
  for (const tool of tools.value) if (tool.badge) set.add(tool.badge)
  return Array.from(set).sort()
})

const filteredTools = computed<any[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return tools.value
    .filter((tool) => selectedBadge.value === 'all' || tool.badge === selectedBadge.value)
    .filter((tool) => {
      if (!query) return true
      const haystack = [tool.title, tool.description, ...(tool.tags || []), tool.badge || '']
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
})
</script>
