<!-- components/ui/HeroSection.vue -->
<template>
  <section class="relative isolate overflow-hidden bg-neutral-950 text-neutral-50">
    <div class="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center md:py-52">
      <div
        class="rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
      >
        <span class="inline-flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-pink-500"></span>
          <span
            class="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-sky-400 bg-clip-text font-medium text-transparent"
          >
            {{ metric }}
          </span>
        </span>
      </div>

      <h1 class="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        Tools that snap into place
      </h1>

      <p class="mt-4 max-w-2xl text-lg text-neutral-300">
        Snappo is a developer toolbox for hashing, key generation, formatting, and everyday
        workflows. Fast, minimal, dark by default.
      </p>

      <div class="mt-8 flex items-center gap-3">
        <NuxtLink to="/tools">
          <Button variant="default" size="lg"> Open Snappo </Button>
        </NuxtLink>
        <a :href="githubUrl" target="_blank" rel="noopener">
          <Button variant="outline" size="lg"> GitHub </Button>
        </a>
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

    <div class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"></div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
const metric = 'Saves a lot of time'
const githubUrl = 'https://github.com/noel-schmidt/snappo'
</script>
