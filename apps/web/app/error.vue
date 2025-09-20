<!-- apps/web/app/error.vue -->
<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button } from '~/components/ui/button'
import AppFooter from "~/components/footer/appFooter.vue";
import AppNavigation from "~/components/navigation/appNavigation.vue";

const props = defineProps<{ error: NuxtError }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
    <AppNavigation />

    <main class="flex-1">
      <section class="px-6">
        <div class="mx-auto max-w-6xl py-24">
          <div class="mx-auto max-w-xl">
            <div
                class="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10 text-center shadow-xl backdrop-blur"
            >
              <div class="mx-auto mb-6 h-16 w-16 rounded-xl border border-neutral-800 bg-neutral-950 grid place-items-center">
                <span class="text-2xl font-semibold tabular-nums">
                  {{ props.error.statusCode || 'Error' }}
                </span>
              </div>

              <h1 class="text-2xl font-semibold tracking-tight">
                {{ props.error.statusMessage || 'Something went wrong' }}
              </h1>
              <p class="mt-2 text-sm text-neutral-400 break-words">
                {{ props.error.message || 'An unexpected error occurred.' }}
              </p>

              <div class="mt-8 flex items-center justify-center gap-3">
                <Button @click="handleError">Back to Home</Button>
                <Button variant="outline" as="a" href="/contact">Contact support</Button>
              </div>
            </div>

            <div class="mt-10 text-center">
              <p class="text-xs text-neutral-500">
                If the issue persists, include the code
                <span class="font-mono text-neutral-300">{{ props.error.statusCode }}</span>
                in your report.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="mt-auto">
      <AppFooter />
    </footer>
  </div>
</template>
