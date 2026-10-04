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

const gen = reactive({
  minute: '*',
  hour: '*',
  dom: '*',
  month: '*',
  dow: '*',
})
const cronOut = computed(() => `${gen.minute} ${gen.hour} ${gen.dom} ${gen.month} ${gen.dow}`)

const cronIn = ref<string>('* * * * *')

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
  <ToolLayout>
    <div class="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-4">
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

    <div class="grid gap-6">
      <div class="flex flex-wrap gap-2">
        <Label class="mr-2">Presets</Label>
        <Button
          v-for="p in presets"
          :key="p.expr"
          variant="outline"
          class="h-9 px-3"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </Button>
      </div>

      <Separator class="bg-muted" />

      <div v-if="mode === 'generator'" class="grid gap-6 lg:grid-cols-2">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="m">Minute</Label>
            <Input id="m" v-model="gen.minute" class="h-11" />
          </div>
          <div class="grid gap-2">
            <Label for="h">Hour</Label>
            <Input id="h" v-model="gen.hour" class="h-11" />
          </div>
          <div class="grid gap-2">
            <Label for="dom">Day of month</Label>
            <Input id="dom" v-model="gen.dom" class="h-11" />
          </div>
          <div class="grid gap-2">
            <Label for="mon">Month</Label>
            <Input id="mon" v-model="gen.month" class="h-11" />
          </div>
          <div class="grid gap-2">
            <Label for="dow">Day of week</Label>
            <Input id="dow" v-model="gen.dow" class="h-11" />
          </div>
        </div>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="expr">Cron expression</Label>
            <Input id="expr" :value="cronOut" readonly class="h-11" />
            <div class="flex gap-2">
              <Button class="h-11 px-5" @click="copyCron">Copy</Button>
            </div>
          </div>
          <div class="grid gap-2">
            <Label>Human readable</Label>
            <Textarea :value="humanReadable" rows="3" readonly />
          </div>
        </div>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-2">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="in">Cron expression</Label>
            <Input id="in" v-model="cronIn" class="h-11" />
            <div class="flex gap-2">
              <Button :disabled="!!errorMsg" class="h-11 px-5" @click="copyCron">Copy</Button>
            </div>
          </div>
          <div class="grid gap-2">
            <Label>Human readable</Label>
            <Textarea :value="humanReadable" rows="3" readonly />
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Fields</Label>
          <div v-if="!errorMsg" class="text-foreground/80 space-y-1 text-sm">
            <div
              ><span class="text-muted-foreground">minute:</span>
              {{ describeField(parsedState.parsed!.minute, 'minute') }}</div
            >
            <div
              ><span class="text-muted-foreground">hour:</span>
              {{ describeField(parsedState.parsed!.hour, 'hour') }}</div
            >
            <div
              ><span class="text-muted-foreground">day of month:</span>
              {{ describeField(parsedState.parsed!.dom, 'dom') }}</div
            >
            <div
              ><span class="text-muted-foreground">month:</span>
              {{ describeField(parsedState.parsed!.month, 'month') }}</div
            >
            <div
              ><span class="text-muted-foreground">day of week:</span>
              {{ describeField(parsedState.parsed!.dow, 'dow') }}</div
            >
          </div>
          <p v-else class="text-destructive text-sm">{{ errorMsg }}</p>
        </div>
      </div>

      <Separator class="bg-muted" />

      <div class="grid gap-2">
        <Label>Next executions</Label>
        <div v-if="!errorMsg && previewRuns.length" class="text-foreground/80 text-sm">
          <ul class="list-disc pl-5">
            <li v-for="d in previewRuns" :key="d.toISOString()">
              {{ d.toLocaleString() }}
            </li>
          </ul>
        </div>
        <p v-else class="text-muted-foreground text-sm"
          >No upcoming runs match this expression yet. Try a more frequent schedule.</p
        >
      </div>
    </div>
    <tool-explanation
      title="Cron expression generator and parser"
      intro="Cron expressions describe recurring schedules with fields for minutes, hours, days, months and weekdays. Their compact syntax is used by many schedulers and automation systems."
      detail="Build a schedule with the generator or enter an existing expression to inspect its meaning. The upcoming run preview helps check that the schedule matches the intended timing."
      use-case="Use this tool when configuring scheduled jobs, backups, scripts or other recurring tasks."
    />
  </ToolLayout>
</template>
