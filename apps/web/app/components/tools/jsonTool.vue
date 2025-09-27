<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import JsonNode from './json/jsonNode.vue'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type IndentOpt = '2' | '4' | 'tab'

const input = ref<string>('')
const output = ref<string>('')
const status = ref<string>('')

const indent = ref<IndentOpt>('2')
const sortKeys = ref<boolean>(false)
const jsonc = ref<boolean>(false)
const viewText = ref<boolean>(false)

const parsed = ref<any | null>(null)

function looksBinary(s: string): boolean {
  if (!s) return false
  let ctrls = 0
  for (let i = 0; i < s.length && i < 4096; i++) {
    const c = s.charCodeAt(i)
    if ((c >= 0 && c < 9) || (c > 13 && c < 32)) ctrls++
  }
  return ctrls > 8
}
function toIndent(i: IndentOpt): number | string {
  return i === '2' ? 2 : i === '4' ? 4 : '\t'
}
function stripJSONC(src: string): string {
  let out = '',
    i = 0,
    inStr = false,
    q = '',
    esc = false
  while (i < src.length) {
    const ch = src[i]
    if (inStr) {
      out += ch
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === q) {
        inStr = false
        q = ''
      }
      i++
      continue
    }
    if (ch === '"' || ch === "'") {
      inStr = true
      q = ch
      out += ch
      i++
      continue
    }
    if (ch === '/' && src[i + 1] === '/') {
      i += 2
      while (i < src.length && src[i] !== '\n') i++
      continue
    }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++
      i += 2
      continue
    }
    out += ch
    i++
  }
  return out.replace(/,\s*(\}|\])/g, '$1')
}
function sortObjectKeys<T>(val: T): T {
  if (Array.isArray(val)) return val.map(sortObjectKeys) as any
  if (val && typeof val === 'object') {
    const obj = val as Record<string, any>
    const sorted: Record<string, any> = {}
    for (const k of Object.keys(obj).sort()) sorted[k] = sortObjectKeys(obj[k])
    return sorted as any
  }
  return val
}
function formatErrorWithPosition(src: string, err: unknown): string {
  const msg = String((err as any)?.message || err)
  const m = /position (\d+)/i.exec(msg)
  if (m) {
    const pos = Number(m[1])
    const before = src.slice(0, pos)
    let line = 1,
      col = 1
    for (let i = 0; i < before.length; i++) {
      if (before[i] === '\n') {
        line++
        col = 1
      } else {
        col++
      }
    }
    return `${msg} (line ${line}, col ${col})`
  }
  return msg
}

function prettify() {
  if (looksBinary(input.value)) {
    failBinary()
    return
  }
  let src = input.value
  if (jsonc.value) src = stripJSONC(src)
  try {
    const obj = JSON.parse(src)
    const finalObj = sortKeys.value ? sortObjectKeys(obj) : obj
    parsed.value = finalObj
    output.value = JSON.stringify(finalObj, toIndent(indent.value) as any)
    status.value = 'Valid JSON'
  } catch (e) {
    parsed.value = null
    output.value = ''
    status.value = formatErrorWithPosition(src, e)
  }
}
function minify() {
  if (looksBinary(input.value)) {
    failBinary()
    return
  }
  let src = input.value
  if (jsonc.value) src = stripJSONC(src)
  try {
    const obj = JSON.parse(src)
    const finalObj = sortKeys.value ? sortObjectKeys(obj) : obj
    parsed.value = finalObj
    output.value = JSON.stringify(finalObj)
    status.value = 'Valid JSON'
  } catch (e) {
    parsed.value = null
    output.value = ''
    status.value = formatErrorWithPosition(src, e)
  }
}
function validateOnly() {
  if (looksBinary(input.value)) {
    failBinary()
    return
  }
  let src = input.value
  if (jsonc.value) src = stripJSONC(src)
  try {
    JSON.parse(src)
    status.value = 'Valid JSON'
  } catch (e) {
    status.value = formatErrorWithPosition(src, e)
  }
}
function failBinary() {
  parsed.value = null
  output.value = ''
  status.value = 'Input looks like non-text/binary. Please paste UTF-8 JSON.'
  toast('Invalid input', { description: status.value })
}

async function copyOut() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    toast('Copied output')
  } catch {}
}
function downloadOut() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-6 md:grid-cols-12">
          <div class="grid gap-5 self-start md:sticky md:top-4 md:col-span-5">
            <div class="grid gap-2">
              <Label for="src">Input (JSON or JSONC)</Label>
              <Textarea
                id="src"
                v-model="input"
                class="h-[420px] resize-none overflow-auto font-mono text-sm leading-6"
                spellcheck="false"
                placeholder="Paste JSON here…"
              />
              <p class="text-xs text-neutral-500"
                >Large-paste friendly. Binary-like input is refused.</p
              >
            </div>

            <div class="grid gap-2">
              <Label>Indentation</Label>
              <Select v-model="indent">
                <SelectTrigger class="w-40"><SelectValue placeholder="2 spaces" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="tab">Tabs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">Sort keys (deep)</span>
                <Switch v-model:checked="sortKeys" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300"
                  >Allow JSONC (comments, trailing commas)</span
                >
                <Switch v-model:checked="jsonc" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">View formatted text instead of tree</span>
                <Switch v-model:checked="viewText" />
              </div>
            </div>

            <div class="flex flex-wrap gap-2 pt-1">
              <Button @click="prettify">Pretty-print</Button>
              <Button variant="outline" @click="minify">Minify</Button>
              <Button variant="ghost" @click="validateOnly">Validate</Button>
            </div>

            <Separator class="bg-neutral-800" />

            <div class="grid gap-1">
              <Label>Status</Label>
              <p
                class="text-sm"
                :class="status.startsWith('Valid') ? 'text-emerald-400' : 'text-red-400'"
              >
                {{ status || '—' }}
              </p>
            </div>

            <div class="flex gap-2">
              <Button :disabled="!output" @click="copyOut">Copy output</Button>
              <Button variant="outline" :disabled="!output" @click="downloadOut">Download</Button>
            </div>
          </div>

          <div class="md:col-span-7">
            <div class="h-full rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <Label class="mb-2 block">Preview</Label>

              <div v-if="!viewText" class="font-mono text-sm leading-6">
                <div v-if="parsed !== null">
                  <JsonNode :v="parsed" :root-open="true" @copy="toast('Copied')" />
                </div>
                <p v-else class="text-sm text-neutral-400"
                  >No parsed data. Pretty-print or minify to parse and preview.</p
                >
              </div>

              <div v-else class="grid gap-2">
                <Textarea
                  v-model="output"
                  class="h-[420px] resize-none overflow-auto font-mono text-sm leading-6"
                  readonly
                  spellcheck="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
