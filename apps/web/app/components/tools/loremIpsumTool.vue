<template>
  <tool-layout>
    <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <div class="grid gap-8 md:grid-cols-3">
        <div class="grid gap-6 md:col-span-1">
          <div class="grid gap-2">
            <Label for="preset">Style</Label>
            <select
              id="preset"
              v-model="preset"
              class="h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
            >
              <option value="classic">Classic</option>
              <option value="tech">Tech</option>
              <option value="hacker">Hacker</option>
            </select>
          </div>

          <div class="grid gap-2">
            <Label for="mode">Mode</Label>
            <select
              id="mode"
              v-model="mode"
              class="h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="count">Count</Label>
              <span class="text-xs text-neutral-400">{{ count }}</span>
            </div>
            <input
              id="count"
              v-model.number="count"
              type="range"
              :min="mode === 'words' ? 10 : 1"
              :max="mode === 'words' ? 300 : 12"
              class="w-full accent-neutral-300"
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="variance">Variance</Label>
              <span class="text-xs text-neutral-400">{{ variance }}</span>
            </div>
            <input
              id="variance"
              v-model.number="variance"
              type="range"
              min="0"
              max="10"
              class="w-full accent-neutral-300"
            />
            <p class="text-xs text-neutral-500">Controls randomness of sentence length.</p>
          </div>

          <div class="grid gap-2">
            <Label for="seed">Seed</Label>
            <Input id="seed" v-model="seedInput" placeholder="optional" />
            <div class="flex gap-2">
              <Button variant="outline" @click="shuffleSeed">Randomize</Button>
              <Button variant="outline" @click="resetOptions">Reset</Button>
            </div>
          </div>

          <div class="grid gap-3">
            <Label>Format</Label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input v-model="html" type="checkbox" class="h-4 w-4" /> HTML
              </label>
              <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input v-model="headings" type="checkbox" class="h-4 w-4" /> Headings
              </label>
            </div>
            <div v-if="headings" class="grid gap-2">
              <div class="flex items-center justify-between">
                <Label for="everyN">Every N paragraphs</Label>
                <span class="text-xs text-neutral-400">{{ everyN }}</span>
              </div>
              <input
                id="everyN"
                v-model.number="everyN"
                type="range"
                min="2"
                max="6"
                class="w-full accent-neutral-300"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Button @click="generate">Generate</Button>
            <Button variant="outline" :disabled="!output" @click="copy">Copy</Button>
            <Button variant="outline" :disabled="!output" @click="clearAll">Clear</Button>
          </div>
        </div>

        <div class="md:col-span-2">
          <div class="grid gap-2">
            <Label for="out">Output</Label>
            <textarea
              id="out"
              v-model="output"
              rows="18"
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
            />
          </div>
          <div class="mt-3 text-xs text-neutral-500">Generated locally in your browser.</div>
        </div>
      </div>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'paragraphs' | 'sentences' | 'words'
type Preset = 'classic' | 'tech' | 'hacker'

const mode = ref<Mode>('paragraphs')
const preset = ref<Preset>('classic')
const count = ref(3)
const variance = ref(5)
const seedInput = ref('')
const html = ref(false)
const headings = ref(false)
const everyN = ref(3)
const output = ref('')

const baseClassic =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' '
  )
const baseTech =
  'api async cache cloud compile container deploy devops endpoint framework function graphql http index interface latency library microservice middleware module monitor package query queue render repository route runtime scale schema sdk serverless socket state storage stream test token type update version virtual wasm'.split(
    ' '
  )
const baseHacker =
  'crypto kernel patch fork commit branch merge nonce buffer overflow exploit payload opcode entropy sandbox syscall daemon malloc pointer hexdump segfault rootkit cipher hash salt brute force rainbow zero-day'.split(
    ' '
  )

function rng(seedStr: string) {
  let s = 0
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967295
  }
}

function pickBase() {
  return preset.value === 'tech' ? baseTech : preset.value === 'hacker' ? baseHacker : baseClassic
}

function cap(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function sentence(r: () => number, words: string[]) {
  const baseLen = 10 + Math.floor(r() * 8)
  const wiggle = Math.floor((variance.value / 10) * 12 * (r() - 0.5) * 2)
  const len = Math.max(4, baseLen + wiggle)
  const arr: string[] = []
  for (let i = 0; i < len; i++) arr.push(words[Math.floor(r() * words.length)])
  return cap(arr.join(' ')) + '.'
}

function paragraph(r: () => number, words: string[]) {
  const sCount = 3 + Math.floor(r() * 3)
  return Array.from({ length: sCount }, () => sentence(r, words)).join(' ')
}

function makeHeading(r: () => number, words: string[]) {
  const len = 2 + Math.floor(r() * 4)
  const arr: string[] = []
  for (let i = 0; i < len; i++) arr.push(words[Math.floor(r() * words.length)])
  return cap(arr.join(' '))
}

function generate() {
  const seed = seedInput.value || `${preset.value}-${mode.value}-${count.value}-${Date.now()}`
  const r = rng(seed)
  const words = pickBase()

  if (mode.value === 'words') {
    output.value = Array.from(
      { length: count.value },
      () => words[Math.floor(r() * words.length)]
    ).join(' ')
    return
  }
  if (mode.value === 'sentences') {
    output.value = Array.from({ length: count.value }, () => sentence(r, words)).join(' ')
    return
  }
  const paras: string[] = []
  for (let i = 0; i < count.value; i++) {
    if (headings.value && i % everyN.value === 0) {
      const h = makeHeading(r, words)
      paras.push(html.value ? `<h3>${h}</h3>` : `## ${h}`)
    }
    const p = paragraph(r, words)
    paras.push(html.value ? `<p>${p}</p>` : p)
  }
  output.value = paras.join(html.value ? '\n' : '\n\n')
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
  } catch {}
}
function clearAll() {
  output.value = ''
}
function shuffleSeed() {
  seedInput.value = Math.random().toString(36).slice(2, 10)
}
function resetOptions() {
  mode.value = 'paragraphs'
  preset.value = 'classic'
  count.value = 3
  variance.value = 5
  seedInput.value = ''
  html.value = false
  headings.value = false
  everyN.value = 3
  output.value = ''
}
</script>
