<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: number | string
    min?: number | string
    max?: number | string
    step?: number | string
    disabled?: boolean
    ariaLabel: string
    class?: HTMLAttributes['class']
  }>(),
  { min: 0, max: 100, step: 1 }
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
function toFiniteNumber(value: number | string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const min = computed(() => toFiniteNumber(props.min, 0))
const max = computed(() => Math.max(min.value, toFiniteNumber(props.max, 100)))
const step = computed(() => Math.max(Number.EPSILON, toFiniteNumber(props.step, 1)))
const value = computed(() =>
  Math.min(max.value, Math.max(min.value, toFiniteNumber(props.modelValue, min.value)))
)
const fill = computed(() => {
  const range = max.value - min.value
  const percent = range > 0 ? ((value.value - min.value) / range) * 100 : 0
  const clampedPercent = Math.min(100, Math.max(0, percent))
  return `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${clampedPercent}%, var(--color-muted) ${clampedPercent}%, var(--color-muted) 100%)`
})

function updateValue(event: Event) {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <input
    type="range"
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :style="{
      background: fill,
      backgroundSize: '100% 0.5rem',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }"
    :class="
      cn(
        'block h-8 w-full cursor-pointer appearance-none rounded-full bg-transparent py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
        '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full',
        '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent',
        '[&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2',
        '[&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm',
        '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:shadow-sm',
        props.class
      )
    "
    @input="updateValue"
  />
</template>
