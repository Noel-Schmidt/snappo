<template>
  <header class="relative bg-neutral-950 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6 py-28">
      <div class="grid items-center gap-16 md:grid-cols-2">
        <div>
          <div
            class="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-1 text-xs ring-1 ring-neutral-800"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Client-side • No installs • No tracking</span>
          </div>

          <h1 class="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span
              class="bg-gradient-to-r from-fuchsia-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent opacity-70"
            >
              About Snappo
            </span>
          </h1>

          <p class="mt-5 max-w-xl text-lg text-neutral-400">
            A developer toolbox built for speed and privacy. Hash, generate, and format directly in
            your browser with a dark-first interface.
          </p>

          <div class="mt-10 flex items-center gap-4">
            <Button as-child>
              <NuxtLink to="/about#story">Read Story</NuxtLink>
            </Button>
            <Button variant="outline" as-child>
              <a href="https://github.com/your-org/snappo" target="_blank" rel="noopener">GitHub</a>
            </Button>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -inset-12 opacity-5">
            <div
              class="h-full w-full bg-[conic-gradient(at_20%_0%,#ec4899,transparent_25%,#8b5cf6_45%,transparent_60%,#38bdf8_80%,transparent_95%)] blur-3xl"
            ></div>
          </div>

          <ul class="relative space-y-6">
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-fuchsia-600"></span>
              <div>
                <p class="text-sm font-semibold text-neutral-100">Privacy-first</p>
                <p class="text-sm text-neutral-400">All tools run locally in your browser.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-sky-600"></span>
              <div>
                <p class="text-sm font-semibold text-neutral-100">Fast by design</p>
                <p class="text-sm text-neutral-400">Minimal UI, instant responses.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-emerald-600"></span>
              <div>
                <p class="text-sm font-semibold text-neutral-100">No setup</p>
                <p class="text-sm text-neutral-400">Open the page and start working.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div
          class="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(99,102,241,0.10),transparent_60%)]"
        ></div>
        <div class="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]">
          <div class="mx-auto h-full max-w-6xl opacity-[0.06]">
            <div class="grid h-full grid-cols-12 gap-x-6">
              <div v-for="i in 12" :key="i" class="border-l border-neutral-500/40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>
