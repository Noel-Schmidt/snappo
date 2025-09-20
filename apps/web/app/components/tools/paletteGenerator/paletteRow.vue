<template>
  <div class="grid gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm text-neutral-300">{{ label }}</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(c, i) in items"
        :key="i"
        class="group relative h-14 w-14 overflow-hidden rounded-md border border-neutral-800"
        :style="{ background: rgbHex(c) }"
        :title="rgbHex(c)"
        @click="onCopy(c)"
      >
        <span
          class="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/40 p-0.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
        >
          {{ rgbHex(c) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'

import type { RGB } from '~/lib/color'
import { rgbHex } from '~/lib/color'

const props = defineProps<{
  label: string
  colors: RGB[] | { value?: RGB[] }
}>()

const items = computed<RGB[]>(() => {
  const c = props.colors
  if (Array.isArray(c)) return c.filter(isRGB)
  const arr = c && Array.isArray(c.value) ? c.value : []
  return arr.filter(isRGB)
})

function isRGB(x: unknown): x is RGB {
  const o = x as any
  return o && Number.isFinite(o.r) && Number.isFinite(o.g) && Number.isFinite(o.b)
}

async function onCopy(c: RGB): Promise<void> {
  const hex = rgbHex(c)
  try {
    await navigator.clipboard.writeText(hex)
  } catch {}
  toast('Copied color', { description: hex })
}
</script>
