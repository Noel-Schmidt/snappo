<template>
  <section
    class="text-foreground mt-16 max-w-4xl space-y-5"
    aria-labelledby="tool-explanation-title"
  >
    <div class="space-y-3">
      <h2 id="tool-explanation-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">
        {{ title }}
      </h2>
      <p class="text-muted-foreground text-base leading-7">{{ intro }}</p>
      <p class="text-muted-foreground text-base leading-7">{{ detail }}</p>
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">When to use it</h3>
      <p class="text-muted-foreground text-base leading-7">{{ useCase }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  intro: string
  detail: string
  useCase: string
}>()
</script>
