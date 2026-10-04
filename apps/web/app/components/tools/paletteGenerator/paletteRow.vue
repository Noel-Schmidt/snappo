<template>
  <section class="grid gap-3">
    <h3 class="text-sm font-semibold">{{ label }}</h3>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-4">
      <button
        v-for="(color, index) in items"
        :key="index"
        class="border-border bg-card hover:bg-muted focus-visible:ring-ring group grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2 rounded-lg border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :aria-label="'Copy ' + rgbHex(color) + ' from ' + label + ' palette'"
        :title="'Copy ' + rgbHex(color)"
        @click="onCopy(color)"
      >
        <span
          class="border-border block h-10 w-10 rounded-md border"
          :style="{ backgroundColor: rgbHex(color) }"
        />
        <code class="truncate font-mono text-xs uppercase">{{ rgbHex(color) }}</code>
      </button>
    </div>
  </section>
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
  const colors = props.colors
  if (Array.isArray(colors)) return colors.filter(isRGB)
  const values = colors && Array.isArray(colors.value) ? colors.value : []
  return values.filter(isRGB)
})

function isRGB(value: unknown): value is RGB {
  const color = value as Partial<RGB> | null
  return Boolean(
    color && Number.isFinite(color.r) && Number.isFinite(color.g) && Number.isFinite(color.b)
  )
}

async function onCopy(color: RGB): Promise<void> {
  const hex = rgbHex(color)
  try {
    await navigator.clipboard.writeText(hex)
    toast('Copied color', { description: hex })
  } catch {
    toast('Could not copy color', { description: 'Check clipboard permissions and try again.' })
  }
}
</script>
