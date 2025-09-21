<!-- components/tools/RegexTester.vue -->
<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-6">
          <!-- Controls -->
          <div class="grid gap-4 md:grid-cols-3">
            <div class="grid gap-2 md:col-span-2">
              <Label for="pattern">Pattern</Label>
              <Input
                id="pattern"
                v-model="pattern"
                placeholder="e.g. (\\w+)@(\\w+\\.\\w+)"
                class="h-10"
              />
              <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
            </div>
            <div class="grid gap-2">
              <Label>Flags</Label>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>g</span><Switch v-model:checked="flags.g" />
                </div>
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>i</span><Switch v-model:checked="flags.i" />
                </div>
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>m</span><Switch v-model:checked="flags.m" />
                </div>
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>s</span><Switch v-model:checked="flags.s" />
                </div>
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>u</span><Switch v-model:checked="flags.u" />
                </div>
                <div
                  class="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2"
                >
                  <span>y</span><Switch v-model:checked="flags.y" />
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div class="grid gap-2 md:col-span-2">
              <Label for="input">Test input</Label>
              <textarea
                id="input"
                v-model="text"
                rows="8"
                class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
                placeholder="Paste text to test"
              />
            </div>
            <div class="grid gap-2">
              <div class="flex items-center justify-between">
                <Label>Replace mode</Label>
                <Switch v-model:checked="replaceMode" />
              </div>
              <Input
                v-model="replacement"
                :disabled="!replaceMode"
                placeholder="Replacement (supports $1, $<name>)"
                class="h-10 disabled:opacity-50"
              />
              <div class="flex flex-wrap gap-2">
                <Button :disabled="!pattern" @click="run">Run</Button>
                <Button variant="outline" :disabled="!pattern && !text" @click="clearAll"
                  >Clear</Button
                >
                <Button variant="outline" :disabled="!pattern || !text" @click="copyResult"
                  >Copy result</Button
                >
              </div>
            </div>
          </div>

          <div
            class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
          ></div>

          <!-- Summary -->
          <div class="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            <Badge variant="secondary" class="border-neutral-700 bg-neutral-800/60 text-neutral-200"
              >Matches: {{ summary.count }}</Badge
            >
            <Badge variant="secondary" class="border-neutral-700 bg-neutral-800/60 text-neutral-200"
              >Time: {{ summary.ms }} ms</Badge
            >
            <Badge
              v-if="named"
              variant="secondary"
              class="border-neutral-700 bg-neutral-800/60 text-neutral-200"
              >Named groups</Badge
            >
          </div>

          <!-- Preview -->
          <div class="grid gap-4 md:grid-cols-2">
            <div class="flex flex-col space-y-4">
              <Label>Highlighted preview</Label>
              <div
                class="min-h-[160px] rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm leading-relaxed"
                v-html="highlighted"
              />
              <p class="text-xs text-neutral-500"
                >Matches are highlighted. Groups use thin underline.</p
              >
            </div>

            <div class="flex flex-col space-y-4">
              <Label>Matches</Label>
              <div class="rounded-md border border-neutral-800 bg-neutral-950">
                <div class="max-h-64 overflow-auto text-sm">
                  <table class="w-full table-fixed border-collapse">
                    <thead class="sticky top-0 bg-neutral-900/70 text-neutral-300">
                      <tr>
                        <th class="px-3 py-2 text-left font-medium">#</th>
                        <th class="px-3 py-2 text-left font-medium">Match</th>
                        <th class="px-3 py-2 text-left font-medium">Index</th>
                        <th class="px-3 py-2 text-left font-medium">Groups</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(m, i) in matches"
                        :key="i"
                        class="border-t border-neutral-800 align-top"
                      >
                        <td class="px-3 py-2 text-neutral-400">{{ i + 1 }}</td>
                        <td class="truncate px-3 py-2">{{ m.value }}</td>
                        <td class="px-3 py-2 text-neutral-400">{{ m.index }}</td>
                        <td class="px-3 py-2">
                          <div class="flex flex-wrap gap-1.5">
                            <Badge
                              v-for="(g, gi) in m.groups"
                              :key="gi"
                              variant="outline"
                              class="border-neutral-700 bg-neutral-900 text-[11px] text-neutral-300"
                            >
                              {{ g.name ? `${g.name}: ` : '' }}{{ g.value }}
                            </Badge>
                            <span v-if="!m.groups.length" class="text-neutral-500">—</span>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="matches.length === 0">
                        <td colspan="4" class="px-3 py-6 text-center text-neutral-500"
                          >No matches</td
                        >
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-if="replaceMode" class="grid gap-2">
                <Label>Replace result</Label>
                <textarea
                  readonly
                  :value="replaced"
                  rows="6"
                  class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const pattern = ref('')
const text = ref('')
const flags = ref({ g: true, i: false, m: false, s: false, u: false, y: false })
const replaceMode = ref(false)
const replacement = ref('')
const error = ref('')
const matches = ref<{ value: string; index: number; groups: { name?: string; value: string }[] }[]>(
  []
)
const highlighted = ref('')
const replaced = ref('')
const summary = ref({ count: 0, ms: 0 })
const named = ref(false)

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  )
}

function buildRegex(): RegExp | null {
  error.value = ''
  try {
    const f = Object.entries(flags.value)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join('')
    if (!pattern.value) return null
    return new RegExp(pattern.value, f)
  } catch (e: any) {
    error.value = e?.message || 'Invalid pattern'
    return null
  }
}

function run() {
  matches.value = []
  highlighted.value = ''
  replaced.value = ''
  summary.value = { count: 0, ms: 0 }
  named.value = false

  const re = buildRegex()
  if (!re || !text.value) {
    highlighted.value = escapeHtml(text.value || '')
    return
  }

  const t0 = performance.now()
  const src = text.value
  const out: { value: string; index: number; groups: { name?: string; value: string }[] }[] = []

  if (!re.global) {
    const m = re.exec(src)
    if (m) {
      const groups = collectGroups(m)
      out.push({ value: m[0], index: m.index, groups })
    }
  } else {
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) {
      const groups = collectGroups(m)
      out.push({ value: m[0], index: m.index, groups })
      if (m[0] === '') re.lastIndex++ // avoid zero-length infinite loop
    }
  }

  matches.value = out
  summary.value = { count: out.length, ms: Math.max(0, Math.round(performance.now() - t0)) }
  named.value = out.some((m) => m.groups.some((g) => g.name))

  highlighted.value = highlight(src, out)
  if (replaceMode.value) {
    try {
      replaced.value = src.replace(re, replacement.value)
    } catch {
      replaced.value = ''
    }
  }
}

function collectGroups(m: RegExpExecArray) {
  const arr: { name?: string; value: string }[] = []
  for (let i = 1; i < m.length; i++) arr.push({ value: m[i] ?? '' })
  if ((m as any).groups) {
    const g = (m as any).groups as Record<string, string>
    Object.entries(g).forEach(([name, value]) => arr.push({ name, value }))
  }
  return arr
}

function highlight(src: string, list: { value: string; index: number }[]) {
  if (!list.length) return escapeHtml(src)
  let html = ''
  let cursor = 0
  for (const m of list) {
    const start = m.index
    const end = m.index + m.value.length
    html += escapeHtml(src.slice(cursor, start))
    html += `<span class="bg-amber-500/20 text-amber-300 underline decoration-dotted decoration-amber-400/60">${escapeHtml(src.slice(start, end))}</span>`
    cursor = end
  }
  html += escapeHtml(src.slice(cursor))
  return html
}

function clearAll() {
  pattern.value = ''
  text.value = ''
  replacement.value = ''
  matches.value = []
  highlighted.value = ''
  replaced.value = ''
  summary.value = { count: 0, ms: 0 }
  error.value = ''
}

async function copyResult() {
  const payload = replaceMode.value
    ? replaced.value
    : matches.value.map((m, i) => `${i + 1}. "${m.value}" @ ${m.index}`).join('\n')
  try {
    await navigator.clipboard.writeText(payload)
  } catch {}
}
</script>
