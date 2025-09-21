<template>
  <tool-layout>
    <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <div class="grid gap-8">
        <div class="grid gap-6 md:grid-cols-3">
          <div class="grid gap-2 md:col-span-2">
            <Label for="src">Input</Label>
            <textarea
              id="src"
              v-model="src"
              rows="8"
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
              placeholder="Paste or type text…"
            />
          </div>
          <div class="grid gap-4">
            <div class="grid gap-3">
              <Label>Options</Label>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">Trim</span>
                <Switch v-model:checked="opts.trim" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">Collapse spaces</span>
                <Switch v-model:checked="opts.collapse" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">Remove diacritics</span>
                <Switch v-model:checked="opts.diacritics" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-300">Preserve acronyms</span>
                <Switch v-model:checked="opts.preserveAcronyms" />
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <Button variant="outline" :disabled="!src" @click="clearAll">Clear</Button>
              <Button variant="outline" :disabled="!src" @click="copyAll">Copy all</Button>
            </div>
            <p class="text-xs text-neutral-500">Runs client-side. No data leaves your browser.</p>
          </div>
        </div>

        <div
          class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
        ></div>

        <div class="grid items-start gap-6 md:grid-cols-2">
          <div class="grid gap-4">
            <div v-for="key in ['lower', 'upper', 'title', 'sentence']" :key="key">
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm text-neutral-300">{{ labels[key] }}</label>
                <button
                  class="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-900 disabled:opacity-40"
                  :disabled="!out[key]"
                  @click="copy(out[key])"
                  >Copy</button
                >
              </div>
              <textarea
                readonly
                rows="2"
                class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
                :value="out[key]"
              />
            </div>
          </div>
          <div class="grid gap-4">
            <div
              v-for="key in ['camel', 'pascal', 'snake', 'kebab', 'constant', 'slug']"
              :key="key"
            >
              <div class="mb-2 flex items-center justify-between">
                <label class="text-sm text-neutral-300">{{ labels[key] }}</label>
                <button
                  class="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-900 disabled:opacity-40"
                  :disabled="!out[key]"
                  @click="copy(out[key])"
                  >Copy</button
                >
              </div>
              <textarea
                readonly
                rows="2"
                class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
                :value="out[key]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type Options = { trim: boolean; collapse: boolean; diacritics: boolean; preserveAcronyms: boolean }
const src = ref('')
const opts = reactive<Options>({
  trim: true,
  collapse: true,
  diacritics: false,
  preserveAcronyms: true,
})

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'via',
  'vs',
])
function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
function splitWordsSmart(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}
function normalizeInput(s: string) {
  let v = s
  if (opts.trim) v = v.trim()
  if (opts.collapse) v = v.replace(/\s+/g, ' ')
  if (opts.diacritics) v = stripDiacritics(v)
  return v
}
function isAcronym(w: string) {
  return opts.preserveAcronyms && /^[A-Z]{2,}$/.test(w)
}
function cap(w: string) {
  return w.charAt(0).toUpperCase() + w.slice(1)
}

function toLower(s: string) {
  return s.toLowerCase()
}
function toUpper(s: string) {
  return s.toUpperCase()
}
function toTitle(s: string) {
  const words = splitWordsSmart(s)
  return words
    .map((w, i) =>
      isAcronym(w)
        ? w
        : i !== 0 && i !== words.length - 1 && SMALL_WORDS.has(w.toLowerCase())
          ? w.toLowerCase()
          : cap(w.toLowerCase())
    )
    .join(' ')
}
function toSentence(s: string) {
  const v = s.toLowerCase().replace(/\s+/g, ' ').trim()
  return v.replace(/(^\s*[a-z])|([\.!\?]\s+[a-z])/g, (m) => m.toUpperCase())
}
function toCamel(s: string) {
  const t = splitWordsSmart(s).map((w) => (isAcronym(w) ? w : w.toLowerCase()))
  return t.length ? t[0].toLowerCase() + t.slice(1).map(cap).join('') : ''
}
function toPascal(s: string) {
  return splitWordsSmart(s)
    .map((w) => (isAcronym(w) ? w : cap(w.toLowerCase())))
    .join('')
}
function toSnake(s: string) {
  return splitWordsSmart(s)
    .map((w) => (isAcronym(w) ? w : w.toLowerCase()))
    .join('_')
}
function toKebab(s: string) {
  return splitWordsSmart(s)
    .map((w) => (isAcronym(w) ? w : w.toLowerCase()))
    .join('-')
}
function toConstant(s: string) {
  return splitWordsSmart(s)
    .map((w) => w.toUpperCase())
    .join('_')
}
function toSlug(s: string) {
  const base = opts.diacritics ? s : stripDiacritics(s)
  return base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const out = reactive({
  lower: '',
  upper: '',
  title: '',
  sentence: '',
  camel: '',
  pascal: '',
  snake: '',
  kebab: '',
  constant: '',
  slug: '',
})
function recompute() {
  const v = normalizeInput(src.value)
  out.lower = toLower(v)
  out.upper = toUpper(v)
  out.title = toTitle(v)
  out.sentence = toSentence(v)
  out.camel = toCamel(v)
  out.pascal = toPascal(v)
  out.snake = toSnake(v)
  out.kebab = toKebab(v)
  out.constant = toConstant(v)
  out.slug = toSlug(v)
}
watch(
  [src, () => opts.trim, () => opts.collapse, () => opts.diacritics, () => opts.preserveAcronyms],
  recompute,
  { immediate: true }
)

const labels: Record<string, string> = {
  lower: 'lowercase',
  upper: 'UPPERCASE',
  title: 'Title Case',
  sentence: 'Sentence case',
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  constant: 'CONSTANT_CASE',
  slug: 'slug',
}

async function copyAll() {
  try {
    await navigator.clipboard.writeText(
      Object.entries(out)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    )
  } catch {}
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}
function clearAll() {
  src.value = ''
}
</script>
