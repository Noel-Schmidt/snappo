<template>
  <header class="relative bg-neutral-950 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6 pt-20">
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

      <div class="grid items-center gap-16 md:grid-cols-2">
        <div>
          <div
            v-if="badge"
            class="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-1 text-xs ring-1 ring-neutral-800"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>{{ badge }}</span>
          </div>

          <h1 class="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span
              class="bg-gradient-to-r from-fuchsia-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent opacity-70"
            >
              {{ title }}
            </span>
          </h1>

          <p v-if="subtitle" class="mt-5 max-w-xl text-lg text-neutral-400">
            {{ subtitle }}
          </p>

          <div v-if="$slots.actions" class="mt-10 flex items-center gap-4">
            <slot name="actions" />
          </div>
        </div>

        <div class="relative hidden justify-center md:flex">
          <slot name="visual" />
        </div>
      </div>

      <div
        class="mt-20 h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
      ></div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  badge?: string
}>()
</script>
