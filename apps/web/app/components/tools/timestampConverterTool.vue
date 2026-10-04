<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div class="grid content-start gap-5">
          <div class="grid gap-2">
            <Label>Conversion</Label>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Conversion direction">
              <button
                v-for="option in modes"
                :key="option.value"
                type="button"
                class="focus-visible:outline-ring rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                :class="
                  mode === option.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background hover:bg-muted'
                "
                :aria-pressed="mode === option.value"
                @click="mode = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="mode === 'to-date'" class="grid gap-2">
            <Label for="timestamp">Unix timestamp</Label>
            <Input
              id="timestamp"
              v-model="input"
              inputmode="decimal"
              placeholder="e.g. 1735689600"
              class="h-11 font-mono"
            />
            <p class="text-muted-foreground text-xs"
              >Choose whether the value is in seconds or milliseconds.</p
            >
          </div>

          <div v-else class="grid gap-2">
            <Label for="iso-date">ISO 8601 date and time</Label>
            <Input
              id="iso-date"
              v-model="input"
              placeholder="2025-01-01T00:00:00Z"
              class="h-11 font-mono"
            />
            <p class="text-muted-foreground text-xs"
              >Include a timezone, for example Z or +02:00.</p
            >
          </div>

          <div v-if="mode === 'to-date'" class="grid gap-2">
            <Label for="unit">Timestamp unit</Label>
            <Select v-model="unit">
              <SelectTrigger id="unit" class="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="milliseconds">Milliseconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid content-start gap-4">
          <div class="flex items-center justify-between gap-3">
            <Label for="timestamp-result">Result</Label>
            <Button variant="outline" size="sm" :disabled="!result.primary" @click="copyResult">
              Copy
            </Button>
          </div>
          <div class="border-border bg-muted/30 min-h-36 rounded-lg border p-4" aria-live="polite">
            <p v-if="result.error" class="text-destructive text-sm" role="alert">
              {{ result.error }}
            </p>
            <template v-else-if="result.primary">
              <code id="timestamp-result" class="text-foreground block break-all font-mono text-sm">
                {{ result.primary }}
              </code>
              <div
                v-if="mode === 'to-timestamp'"
                class="text-muted-foreground mt-4 grid gap-2 text-sm"
              >
                <p
                  >Seconds: <code class="text-foreground font-mono">{{ result.seconds }}</code></p
                >
                <p
                  >Milliseconds:
                  <code class="text-foreground font-mono">{{ result.milliseconds }}</code></p
                >
              </div>
            </template>
            <p v-else class="text-muted-foreground text-sm">Enter a value to convert it.</p>
          </div>
          <p class="text-muted-foreground text-xs"
            >Dates are shown in UTC. Conversion runs in your browser.</p
          >
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Unix timestamps and UTC dates"
      intro="A Unix timestamp counts time from 1970-01-01 00:00:00 UTC. APIs commonly use seconds or milliseconds."
      detail="Convert a timestamp to an ISO 8601 date, or convert a timezone-qualified ISO date back to both timestamp units. Requiring a timezone avoids silently interpreting the date in your local time zone."
      use-case="Check API values, compare log times, or prepare date values for a request or database."
    />
  </ToolLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import ToolLayout from '@/components/tool/toolLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ToolExplanation from '~/components/tool/toolExplanation.vue'

type Mode = 'to-date' | 'to-timestamp'
type Unit = 'seconds' | 'milliseconds'

const modes: { value: Mode; label: string }[] = [
  { value: 'to-date', label: 'Timestamp to date' },
  { value: 'to-timestamp', label: 'Date to timestamp' },
]

const mode = ref<Mode>('to-date')
const unit = ref<Unit>('seconds')
const input = ref('')

const result = computed(() => {
  const value = input.value.trim()
  if (!value) return { primary: '', seconds: '', milliseconds: '', error: '' }

  if (mode.value === 'to-date') {
    const timestamp = Number(value)
    if (!Number.isFinite(timestamp)) {
      return {
        primary: '',
        seconds: '',
        milliseconds: '',
        error: 'Enter a valid numeric timestamp.',
      }
    }
    const date = new Date(unit.value === 'seconds' ? timestamp * 1000 : timestamp)
    if (Number.isNaN(date.getTime())) {
      return {
        primary: '',
        seconds: '',
        milliseconds: '',
        error: 'This timestamp is outside the supported date range.',
      }
    }
    return { primary: date.toISOString(), seconds: '', milliseconds: '', error: '' }
  }

  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    return {
      primary: '',
      seconds: '',
      milliseconds: '',
      error: 'Use an ISO 8601 date with a timezone, such as 2025-01-01T12:00:00Z.',
    }
  }

  const time = Date.parse(value)
  if (!Number.isFinite(time)) {
    return { primary: '', seconds: '', milliseconds: '', error: 'Enter a valid ISO 8601 date.' }
  }

  const seconds = String(time / 1000)
  const milliseconds = String(time)
  return {
    primary: unit.value === 'seconds' ? seconds : milliseconds,
    seconds,
    milliseconds,
    error: '',
  }
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value.primary)
    toast('Result copied')
  } catch {
    toast('Could not copy result', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
