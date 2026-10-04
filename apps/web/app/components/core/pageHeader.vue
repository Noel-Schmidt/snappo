<template>
  <header
    class="border-border bg-background text-foreground relative isolate overflow-hidden border-b"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
    >
      <div class="mx-auto grid h-full max-w-7xl grid-cols-12">
        <div v-for="column in 12" :key="column" class="border-border/40 border-l last:border-r" />
      </div>
    </div>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-64 left-1/2 h-[34rem] w-[min(80rem,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.09),transparent_68%)] blur-2xl"
    />

    <div
      class="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:py-20 lg:py-24"
      :class="{ 'md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:items-center': $slots.visual }"
    >
      <div>
        <h1
          class="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
        >
          <slot name="heading">{{ title }}</slot>
        </h1>

        <p v-if="subtitle" class="text-muted-foreground mt-5 max-w-2xl text-lg leading-8">
          {{ subtitle }}
        </p>

        <div v-if="$slots.actions" class="mt-8 flex flex-wrap items-center gap-3">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.visual" class="relative flex justify-center">
        <slot name="visual" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
