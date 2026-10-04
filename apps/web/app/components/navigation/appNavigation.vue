<template>
  <nav
    class="border-border/80 bg-background/90 text-foreground sticky top-0 z-40 w-full border-b backdrop-blur-xl"
  >
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
      <NuxtLink
        to="/"
        class="focus-visible:outline-ring flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label="Snappo home"
      >
        <img alt="" class="w-9" src="/images/snappo.svg" />
        <span class="text-base font-semibold tracking-tight">Snappo</span>
      </NuxtLink>

      <ul class="ml-4 hidden h-full items-center gap-1 text-sm md:flex">
        <li v-for="item in items" :key="item.href">
          <NuxtLink
            :to="item.href"
            class="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex h-10 items-center rounded-md px-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            :class="{ 'text-foreground': isActive(item.href) }"
            :aria-current="isActive(item.href) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <div class="ml-auto hidden items-center gap-2 md:flex">
        <app-navigation-search />
        <Button variant="outline" size="lg" as-child>
          <a
            href="https://github.com/Noel-Schmidt/snappo/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Feedback
          </a>
        </Button>
        <Button class="h-9 bg-teal-400 px-3 text-neutral-950 hover:bg-teal-300" as-child>
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer" class="gap-2">
            <Github class="h-4 w-4" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </Button>
      </div>

      <div class="ml-auto flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon-lg"
          class="h-9 w-9"
          :aria-expanded="open"
          aria-label="Toggle navigation menu"
          @click="open = !open"
        >
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
      <div
        v-if="open"
        class="border-border bg-background border-t px-4 pb-5 pt-4 sm:px-6 md:hidden"
      >
        <div class="mb-4">
          <app-navigation-search />
        </div>
        <ul class="grid gap-1">
          <li v-for="item in items" :key="item.href + '-m'">
            <NuxtLink
              :to="item.href"
              class="text-muted-foreground hover:text-foreground flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors"
              :class="{ 'text-foreground': isActive(item.href) }"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              @click="open = false"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" as-child>
            <a
              href="https://github.com/Noel-Schmidt/snappo/issues"
              target="_blank"
              rel="noopener noreferrer"
              @click="open = false"
            >
              Feedback
            </a>
          </Button>
          <Button size="lg" class="bg-teal-400 text-neutral-950 hover:bg-teal-300" as-child>
            <a
              :href="githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="gap-2"
              @click="open = false"
            >
              <Github class="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { Github, Menu, X } from 'lucide-vue-next'
import { ref } from 'vue'

import { useRoute } from '#imports'
import { Button } from '@/components/ui/button'
import AppNavigationSearch from '~/components/navigation/appNavigationSearch.vue'

const route = useRoute()
const open = ref(false)

const items = [
  { label: 'Explore tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const githubUrl = 'https://github.com/noel-schmidt/snappo'

function isActive(href: string) {
  return route.path === href || (href !== '/' && route.path.startsWith(`${href}/`))
}
</script>
