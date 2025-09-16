<!-- components/ui/FeaturesSection.vue -->
<template>
  <section class="bg-neutral-950 text-neutral-50 py-24">
    <div class="mx-auto max-w-6xl px-6">
      <div class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs ring-1 ring-neutral-800">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>Client-side • No accounts • No tracking</span>
        </div>
        <h2 class="text-4xl font-extrabold tracking-tight sm:text-5xl">Build faster, stay secure</h2>
        <p class="text-lg text-neutral-300">
          Snappo bundles essential developer utilities for hashing, key generation, and data formatting. Runs locally in your browser by default to keep your data private.
        </p>
      </div>

      <div class="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="f in features" :key="f.title" class="group">
          <div class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 ring-1 ring-neutral-800 group-hover:ring-neutral-700 transition">
            <component :is="f.icon" class="h-5 w-5 text-neutral-100" />
          </div>
          <h3 class="text-lg font-semibold">{{ f.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-neutral-300">{{ f.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Key, Hash, FileCode, Clock, Network, Palette } from 'lucide-vue-next'

const features = [
  { title: 'Hash Generators', description: 'Create bcrypt, SHA, and Argon2 hashes directly in the browser.', icon: Hash },
  { title: 'Keys & Passwords', description: 'Generate strong API keys and passwords with entropy controls.', icon: Key },
  { title: 'Data Formatters', description: 'Validate and format JSON, YAML, and CSV without sending data to a server.', icon: FileCode },
  { title: 'Time Utilities', description: 'Convert Unix timestamps and compose cron expressions quickly.', icon: Clock },
  { title: 'Network Tools', description: 'Inspect IPs and CIDR ranges with zero telemetry.', icon: Network },
  { title: 'Color Tools', description: 'Convert HEX, RGB, and HSL with instant previews.', icon: Palette }
]
</script>
