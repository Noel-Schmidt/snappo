<!-- components/ui/AppNavbar.vue -->
<template>
  <nav class="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur text-neutral-100">
    <div class="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-4 md:px-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <img class="w-10" src="/images/snappo.svg" />
        <span class="font-semibold tracking-tight">Snappo</span>
      </NuxtLink>

      <ul class="ml-4 hidden items-center gap-4 text-sm md:flex">
        <li v-for="item in items" :key="item.href">
          <NuxtLink
              :to="item.href"
              class="text-neutral-300 transition-colors hover:text-white"
              :class="{ 'text-white': route.path === item.href }"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="ml-auto flex items-center gap-2">
        <div class="hidden md:block">
          <Input v-model="query" placeholder="Search" class="h-9 w-48 bg-neutral-800/70 text-neutral-100 placeholder:text-neutral-400 focus-visible:ring-neutral-500" />
        </div>
        <Button variant="outline" class="hidden h-9 border-neutral-700 text-neutral-100 hover:bg-neutral-800 md:inline-flex">Feedback</Button>
        <Button variant="secondary" class="h-9 bg-neutral-800 text-neutral-100 hover:bg-neutral-700" as-child>
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2">
            <Github class="h-4 w-4" />
            <span class="hidden sm:inline">GitHub</span>
          </a>
        </Button>
        <Button variant="ghost" class="ml-1 inline-flex h-9 w-9 items-center justify-center md:hidden" @click="open = !open">
          <Menu v-if="!open" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" class="border-t border-neutral-800 bg-neutral-900/95 px-3 pb-4 pt-2 md:hidden">
        <div class="mb-3">
          <Input v-model="query" placeholder="Search" class="h-10 w-full bg-neutral-800/70 text-neutral-100 placeholder:text-neutral-400 focus-visible:ring-neutral-500" />
        </div>
        <ul class="grid gap-2">
          <li v-for="item in items" :key="item.href + '-m'">
            <NuxtLink
                :to="item.href"
                class="block rounded-md px-2 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                @click="open = false"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="mt-3 flex items-center gap-2">
          <Button variant="outline" class="h-9 flex-1 border-neutral-700 text-neutral-100 hover:bg-neutral-800">Feedback</Button>
          <Button variant="secondary" class="h-9 flex-1 bg-neutral-800 text-neutral-100 hover:bg-neutral-700" as-child>
            <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2">
              <Github class="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from '#imports'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Menu, X } from 'lucide-vue-next'

const route = useRoute()
const open = ref(false)
const query = ref('')

const items = [
  { label: 'Featured Tools', href: '/featured' },
  { label: 'All Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

const githubUrl = 'https://github.com/your-org/snappo'
</script>
