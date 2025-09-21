<!-- apps/web/app/components/tools/cronTool.vue -->
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type Mode = 'generator' | 'parser'
const mode = ref<Mode>('generator')

/* Generator state */
const gen = reactive({
  minute: '*',
  hour: '*',
  dom: '*',
  month: '*',
  dow: '*',
})
const cronOut = computed(() => `${gen.minute} ${gen.hour} ${gen.dom} ${gen.month} ${gen.dow}`)

/* Parser state */
const cronIn = ref<string>('* * * * *')

/* Cron parsing logic */
type Field = 'minute' | 'hour' | 'dom' | 'month' | 'dow'
type Spec = {
  any: boolean
  items: number[]
  ranges: Array<[number, number]>
  steps?: number
  raw: string
}
type ParsedCron = { minute: Spec; hour: Spec; dom: Spec; month: Spec; dow: Spec }

const limits: Record<Field, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dom: [1, 31],
  month: [1, 12],
  dow: [0, 7],
}

function normalizeFieldValue(n: number, field: Field): number {
  let v = Math.trunc(n)
  const [min, max] = limits[field]
  if (field === 'dow' && v === 7) v = 0
  if (v < min || v > max) throw new Error(`Out of range for ${field}: ${n}`)
  return v
}

function parseField(raw: string, field: Field): Spec {
  const s = raw.trim()
  const spec: Spec = { any: false, items: [], ranges: [], raw: s }
  if (s === '*' || s === '?') {
    spec.any = true
    return spec
  }

  const [min, _max] = limits[field]
  const parts = s.split(',')
  for (const part of parts) {
    const p = part.trim()
    if (!p) throw new Error(`Empty token in ${field}`)
    const stepSplit = p.split('/')
    const base = stepSplit[0]
    const step = stepSplit[1] !== undefined ? Number(stepSplit[1]) : undefined
    if (stepSplit[1] !== undefined) {
      if (!Number.isFinite(step!) || step! <= 0) throw new Error(`Invalid step in ${field}: ${p}`)
      spec.steps = step
    }

    if (base === '*') {
      spec.any = true
      continue
    }

    if (base.includes('-')) {
      const [a, b] = base.split('-').map(Number)
      if (!Number.isFinite(a) || !Number.isFinite(b))
        throw new Error(`Invalid range in ${field}: ${base}`)
      const aa = normalizeFieldValue(a, field)
      const bb = normalizeFieldValue(b, field)
      if (aa > bb) throw new Error(`Range start > end in ${field}: ${base}`)
      spec.ranges.push([aa, bb])
    } else {
      const n = Number(base)
      if (!Number.isFinite(n)) throw new Error(`Invalid number in ${field}: ${base}`)
      const v = normalizeFieldValue(n, field)
      spec.items.push(v)
    }
  }
  return spec
}

function parseCron(expr: string): ParsedCron {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) throw new Error('Cron must have exactly 5 fields: m h dom mon dow')
  const [m, h, dom, mon, dow] = parts
  return {
    minute: parseField(m, 'minute'),
    hour: parseField(h, 'hour'),
    dom: parseField(dom, 'dom'),
    month: parseField(mon, 'month'),
    dow: parseField(dow, 'dow'),
  }
}

function valueMatches(v: number, spec: Spec, field: Field): boolean {
  const [min, _max] = limits[field]
  if (spec.any) {
    if (spec.steps && (v - min) % spec.steps !== 0) return false
    return true
  }
  if (spec.items.includes(v)) return true
  for (const [a, b] of spec.ranges) {
    if (v >= a && v <= b) {
      if (spec.steps) return (v - a) % spec.steps === 0
      return true
    }
  }
  if (spec.steps && spec.items.length === 0 && spec.ranges.length === 0) {
    return (v - min) % spec.steps === 0
  }
  return false
}

function matches(date: Date, cron: ParsedCron): boolean {
  const m = date.getMinutes()
  const h = date.getHours()
  const d = date.getDate()
  const mon = date.getMonth() + 1
  const dow = date.getDay()

  if (!valueMatches(m, cron.minute, 'minute')) return false
  if (!valueMatches(h, cron.hour, 'hour')) return false
  if (!valueMatches(mon, cron.month, 'month')) return false

  const domAny = cron.dom.any
  const dowAny = cron.dow.any
  const domOk = valueMatches(d, cron.dom, 'dom')
  const dowOk = valueMatches(dow, cron.dow, 'dow')
  if (domAny && dowAny) return true
  if (domAny) return dowOk
  if (dowAny) return domOk
  return domOk || dowOk
}

function nextRuns(expr: string, count = 5, start?: Date): Date[] {
  const cron = parseCron(expr)
  const out: Date[] = []
  const now = start ? new Date(start) : new Date()
  now.setSeconds(0, 0)
  let t = new Date(now.getTime() + 60_000)
  let steps = 0
  const maxSteps = 60 * 24 * 366
  while (out.length < count && steps < maxSteps) {
    if (matches(t, cron)) out.push(new Date(t))
    t = new Date(t.getTime() + 60_000)
    steps++
  }
  return out
}

/* Human readable */
function describeField(spec: Spec, field: Field): string {
  const namesMonth = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const namesDow = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const label = (n: number) => {
    if (field === 'month') return namesMonth[n] || String(n)
    if (field === 'dow') return namesDow[n === 7 ? 0 : n] || String(n)
    return String(n)
  }
  const [min, _max] = limits[field]
  if (spec.any && !spec.steps) return 'every'
  const parts: string[] = []
  if (spec.any && spec.steps) parts.push(`every ${spec.steps}`)
  if (spec.items.length) parts.push(spec.items.map(label).join(', '))
  if (spec.ranges.length) {
    parts.push(
      spec.ranges
        .map(([a, b]) => `${label(a)}–${label(b)}${spec.steps ? ` step ${spec.steps}` : ''}`)
        .join(', ')
    )
  }
  if (parts.length === 0) {
    if (spec.steps) return `every ${spec.steps} from ${label(min)}`
    return 'never'
  }
  return parts.join(', ')
}

function describeCron(expr: string): string {
  const c = parseCron(expr)
  const min = describeField(c.minute, 'minute')
  const hour = describeField(c.hour, 'hour')
  const mon = describeField(c.month, 'month')
  const domAny = c.dom.any
  const dowAny = c.dow.any
  const domText = describeField(c.dom, 'dom')
  const dowText = describeField(c.dow, 'dow')
  const dayPart =
    domAny && dowAny
      ? 'every day'
      : domAny
        ? `on ${dowText}`
        : dowAny
          ? `on day ${domText}`
          : `on ${dowText} or day ${domText}`
  return `Runs at ${hour} and ${min}, ${dayPart}, in ${mon}.`
}

/* Pure computed validation state */
const currentExpr = computed(() => (mode.value === 'generator' ? cronOut.value : cronIn.value))
type ParsedState = { parsed: ParsedCron | null; error: string }
const parsedState = computed<ParsedState>(() => {
  try {
    return { parsed: parseCron(currentExpr.value), error: '' }
  } catch (e: any) {
    return { parsed: null, error: String(e?.message || e) }
  }
})
const errorMsg = computed(() => parsedState.value.error)
const previewRuns = computed(() => {
  if (!parsedState.value.parsed) return []
  try {
    return nextRuns(currentExpr.value, 5)
  } catch {
    return []
  }
})
const humanReadable = computed(() => {
  if (!parsedState.value.parsed) return ''
  try {
    return describeCron(currentExpr.value)
  } catch {
    return ''
  }
})
async function copyCron() {
  if (errorMsg.value) return
  try {
    await navigator.clipboard.writeText(currentExpr.value)
    toast('Copied cron')
  } catch {}
}

/* Presets */
type Preset = { label: string; expr: string }
const presets: Preset[] = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily 00:00', expr: '0 0 * * *' },
  { label: 'Weekly Sun 00:00', expr: '0 0 * * 0' },
  { label: 'Monthly 1st 00:00', expr: '0 0 1 * *' },
]
function applyPreset(p: Preset) {
  const [m, h, dom, mon, dow] = p.expr.split(' ')
  if (mode.value === 'generator') {
    gen.minute = m
    gen.hour = h
    gen.dom = dom
    gen.month = mon
    gen.dow = dow
  } else {
    cronIn.value = p.expr
  }
}
</script>

<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-6 flex items-center gap-3">
        <Label>Mode</Label>
        <Select v-model="mode">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="generator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="generator">Generator</SelectItem>
            <SelectItem value="parser">Parser</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid gap-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="flex flex-wrap gap-2">
          <Label class="mr-2">Presets</Label>
          <Button
            v-for="p in presets"
            :key="p.expr"
            variant="outline"
            class="h-8 px-3"
            @click="applyPreset(p)"
          >
            {{ p.label }}
          </Button>
        </div>

        <Separator class="bg-neutral-800" />

        <div v-if="mode === 'generator'" class="grid gap-5 md:grid-cols-2">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="m">Minute</Label>
              <Input id="m" v-model="gen.minute" />
            </div>
            <div class="grid gap-2">
              <Label for="h">Hour</Label>
              <Input id="h" v-model="gen.hour" />
            </div>
            <div class="grid gap-2">
              <Label for="dom">Day of month</Label>
              <Input id="dom" v-model="gen.dom" />
            </div>
            <div class="grid gap-2">
              <Label for="mon">Month</Label>
              <Input id="mon" v-model="gen.month" />
            </div>
            <div class="grid gap-2">
              <Label for="dow">Day of week</Label>
              <Input id="dow" v-model="gen.dow" />
            </div>
          </div>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="expr">Cron expression</Label>
              <Input id="expr" :value="cronOut" readonly />
              <div class="flex gap-2">
                <Button @click="copyCron">Copy</Button>
              </div>
            </div>
            <div class="grid gap-2">
              <Label>Human readable</Label>
              <Textarea :value="humanReadable" rows="3" readonly />
            </div>
          </div>
        </div>

        <div v-else class="grid gap-5 md:grid-cols-2">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="in">Cron expression</Label>
              <Input id="in" v-model="cronIn" />
              <div class="flex gap-2">
                <Button :disabled="!!errorMsg" @click="copyCron">Copy</Button>
              </div>
            </div>
            <div class="grid gap-2">
              <Label>Human readable</Label>
              <Textarea :value="humanReadable" rows="3" readonly />
            </div>
          </div>

          <div class="grid gap-2">
            <Label>Fields</Label>
            <div v-if="!errorMsg" class="space-y-1 text-sm text-neutral-300">
              <div
                ><span class="text-neutral-500">minute:</span>
                {{ describeField(parsedState.parsed!.minute, 'minute') }}</div
              >
              <div
                ><span class="text-neutral-500">hour:</span>
                {{ describeField(parsedState.parsed!.hour, 'hour') }}</div
              >
              <div
                ><span class="text-neutral-500">day of month:</span>
                {{ describeField(parsedState.parsed!.dom, 'dom') }}</div
              >
              <div
                ><span class="text-neutral-500">month:</span>
                {{ describeField(parsedState.parsed!.month, 'month') }}</div
              >
              <div
                ><span class="text-neutral-500">day of week:</span>
                {{ describeField(parsedState.parsed!.dow, 'dow') }}</div
              >
            </div>
            <p v-else class="text-sm text-red-400">{{ errorMsg }}</p>
          </div>
        </div>

        <Separator class="bg-neutral-800" />

        <div class="grid gap-2">
          <Label>Next executions</Label>
          <div v-if="!errorMsg && previewRuns.length" class="text-sm text-neutral-300">
            <ul class="list-disc pl-5">
              <li v-for="d in previewRuns" :key="d.toISOString()">
                {{ d.toLocaleString() }}
              </li>
            </ul>
          </div>
          <p v-else class="text-sm text-neutral-400">No preview available.</p>
        </div>
      </div>
    </div>
  </section>
</template>
