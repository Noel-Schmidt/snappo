<!-- apps/web/app/components/nav/NavToolSearch.vue -->
<script setup lang="ts">
import { Search, Tag } from 'lucide-vue-next'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { toast } from 'vue-sonner'

import { useAppConfig, navigateTo } from '#imports'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

type Tool = {
  slug: string
  title: string
  description?: string
  tags?: string[]
}

const open = ref(false)
const q = ref('')

const appCfg = useAppConfig() as { tools?: Tool[] }
const allTools = computed<Tool[]>(() => (Array.isArray(appCfg.tools) ? appCfg.tools : []))

const filtered = computed<Tool[]>(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return allTools.value.slice(0, 20)
  return allTools.value
    .filter((t) => {
      const hay = [t.title, t.description, ...(t.tags || []), t.slug]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(query)
    })
    .slice(0, 50)
})

function openSearch() {
  open.value = true
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('[data-cmd-input]')
    el?.focus()
  })
}

function closeSearch() {
  open.value = false
  q.value = ''
}

function onSelect(tool: Tool) {
  toast('Opening tool', { description: tool.title })
  closeSearch()
  navigateTo(`/tools/${tool.slug}`)
}

function onKeydown(e: KeyboardEvent) {
  const isSlash = e.key === '/'
  const isK = e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)
  if (isSlash || isK) {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="group flex h-9 w-full items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/40 px-3 text-left text-sm text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900 focus:outline-none md:w-80"
        aria-label="Search tools"
        @click="openSearch"
      >
        <Search class="h-4 w-4 text-neutral-500" />
        <span class="flex-1 truncate text-neutral-400 group-hover:text-neutral-300"
          >Search tools</span
        >
        <kbd
          class="hidden rounded border border-neutral-700 bg-neutral-950 px-1.5 py-0.5 text-[10px] text-neutral-400 md:block"
          >/</kbd
        >
      </button>
    </PopoverTrigger>

    <PopoverContent align="start" class="w-[520px] border-neutral-800 bg-neutral-950 p-0">
      <Command>
        <CommandInput
          v-model="q"
          data-cmd-input
          placeholder="Type to search tools…"
          class="placeholder:text-neutral-500"
        />
        <CommandList class="max-h-80">
          <CommandEmpty>No tools found.</CommandEmpty>

          <CommandGroup heading="Tools">
            <CommandItem
              v-for="t in filtered"
              :key="t.slug"
              :value="t.title"
              class="flex items-start gap-3"
              @select="onSelect(t)"
            >
              <div class="mt-0.5">
                <Search class="h-4 w-4 text-neutral-500" />
              </div>
              <div class="min-w-0">
                <div class="text-sm text-neutral-100">{{ t.title }}</div>
                <div class="line-clamp-1 text-xs text-neutral-400"> /tools/{{ t.slug }} </div>
                <div v-if="t.tags?.length" class="mt-1 flex flex-wrap gap-1.5">
                  <Badge
                    v-for="tag in t.tags.slice(0, 4)"
                    :key="tag"
                    variant="secondary"
                    class="border-neutral-800 bg-neutral-900 text-neutral-300"
                  >
                    <Tag class="mr-1 h-3 w-3" /> {{ tag }}
                  </Badge>
                </div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
