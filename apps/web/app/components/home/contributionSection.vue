<template>
  <section class="bg-neutral-950 text-neutral-50 py-24">
    <div class="mx-auto max-w-6xl px-6">
      <div class="relative overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-950">
        <div class="pointer-events-none absolute inset-0 opacity-10">
          <div class="absolute -inset-32 bg-[conic-gradient(at_30%_10%,#ec4899,transparent_20%,#8b5cf6_40%,transparent_55%,#38bdf8_70%,transparent_85%)] blur-3xl"></div>
        </div>

        <div class="relative p-8 sm:p-12">
          <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Contributing</h2>
          <p class="mt-4 max-w-3xl text-lg text-neutral-300">
            Snappo is open source. Contributions, bug reports, and feature ideas are welcome. Keep it simple, secure, and fast.
          </p>

          <ul class="mt-8 grid gap-4 text-sm text-neutral-300 sm:grid-cols-2">
            <li class="flex items-start gap-3">
              <span class="h-2 w-2 translate-y-2 rounded-full bg-emerald-400"></span>
              Fork the repo and create a feature branch.
            </li>
            <li class="flex items-start gap-3">
              <span class="h-2 w-2 translate-y-2 rounded-full bg-emerald-400"></span>
              Follow Conventional Commits and run the linter.
            </li>
            <li class="flex items-start gap-3">
              <span class="h-2 w-2 translate-y-2 rounded-full bg-emerald-400"></span>
              Keep changes scoped. Add minimal tests if applicable.
            </li>
            <li class="flex items-start gap-3">
              <span class="h-2 w-2 translate-y-2 rounded-full bg-emerald-400"></span>
              Open a pull request and describe the rationale.
            </li>
          </ul>

          <div class="mt-10 flex flex-wrap items-center gap-3">
            <Button as-child>
              <a :href="githubUrl" target="_blank" rel="noopener">Open on GitHub</a>
            </Button>
            <Button variant="outline" as-child>
              <a :href="contribUrl" target="_blank" rel="noopener">Read CONTRIBUTING.md</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

const githubUrl = 'https://github.com/noel-schmidt/snappo'
const contribUrl = 'https://github.com/noel-schmidt/snappo/blob/main/CONTRIBUTING.md'
</script>
