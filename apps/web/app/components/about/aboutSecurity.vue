<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="max-w-3xl">
        <h2 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Security & Privacy</h2>
        <p class="mt-4 text-lg text-neutral-300">
          Snappo runs client-side by default. No accounts, no telemetry, no background services.
        </p>
      </div>

      <div class="mt-12 grid gap-10 md:grid-cols-2">
        <div class="space-y-5">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-400">Principles</h3>
          <ul class="space-y-4 text-neutral-300">
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-emerald-500"></span>
              <div>
                <p class="text-neutral-100">Client-side by default</p>
                <p class="text-sm"
                  >Hashing, key generation, and formatters execute in your browser.</p
                >
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-sky-500"></span>
              <div>
                <p class="text-neutral-100">No data collection</p>
                <p class="text-sm">No accounts, analytics, or tracking pixels.</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-2 h-2 w-2 rounded-full bg-fuchsia-500"></span>
              <div>
                <p class="text-neutral-100">Transparent scope</p>
                <p class="text-sm"
                  >Network requests only occur for features that explicitly need them.</p
                >
              </div>
            </li>
          </ul>
        </div>

        <div class="space-y-5">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-400">Reporting</h3>
          <div class="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm">
            <p class="text-neutral-300">
              Found a security issue? Do not open a public issue. Contact:
            </p>
            <p class="mt-2 text-neutral-100">
              <a
                href="mailto:hello@snappo.me"
                class="underline decoration-neutral-600 underline-offset-4 hover:text-white"
                >hello@snappo.me</a
              >
            </p>
            <ul class="mt-5 space-y-2 text-sm text-neutral-300">
              <li>Include steps to reproduce and environment details.</li>
              <li>We review promptly and coordinate disclosure.</li>
            </ul>
            <div class="mt-6 flex gap-3">
              <Button as-child>
                <NuxtLink to="https://github.com/Noel-Schmidt/snappo/security/policy"
                  >Security Policy</NuxtLink
                >
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>
