<template>
  <tool-layout>
    <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <div class="grid gap-8">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="grid gap-2">
            <Label for="left">Left</Label>
            <textarea
              id="left"
              v-model="left"
              rows="10"
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
              placeholder="Paste original text"
            />
          </div>
          <div class="grid gap-2">
            <Label for="right">Right</Label>
            <textarea
              id="right"
              v-model="right"
              rows="10"
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
              placeholder="Paste changed text"
            />
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div class="grid gap-3">
            <Label>Options</Label>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Ignore whitespace</span
              ><Switch v-model:checked="opts.ignoreWs"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Trim line ends</span
              ><Switch v-model:checked="opts.trim"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Ignore case</span
              ><Switch v-model:checked="opts.ignoreCase"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Word highlights</span
              ><Switch v-model:checked="opts.wordLevel"
            /></div>
          </div>

          <div class="grid gap-3">
            <Label>View</Label>
            <div class="flex items-center gap-2">
              <Button
                :variant="mode === 'side' ? 'default' : 'outline'"
                size="sm"
                @click="mode = 'side'"
                >Side-by-Side</Button
              >
              <Button
                :variant="mode === 'unified' ? 'default' : 'outline'"
                size="sm"
                @click="mode = 'unified'"
                >Unified</Button
              >
            </div>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Wrap long lines</span
              ><Switch v-model:checked="wrap"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-sm text-neutral-300">Show line numbers</span
              ><Switch v-model:checked="lineNumbers"
            /></div>
            <div class="flex flex-wrap gap-2">
              <Button :disabled="!left && !right" @click="run">Compare</Button>
              <Button variant="outline" :disabled="!left && !right" @click="clearAll">Clear</Button>
              <Button variant="outline" :disabled="!diffRows.length" @click="copyUnified"
                >Copy unified</Button
              >
            </div>
          </div>

          <div class="grid gap-3">
            <Label>Summary</Label>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <Badge
                variant="secondary"
                class="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                >+ {{ stats.added }} added</Badge
              >
              <Badge
                variant="secondary"
                class="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                >− {{ stats.removed }} removed</Badge
              >
              <Badge
                variant="secondary"
                class="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                >= {{ stats.unchanged }} unchanged</Badge
              >
              <Badge
                variant="secondary"
                class="border-neutral-700 bg-neutral-800/60 text-neutral-100"
                >{{ stats.time }} ms</Badge
              >
            </div>
          </div>
        </div>

        <div
          class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
        ></div>

        <div v-if="mode === 'side'" class="grid gap-3">
          <div class="overflow-auto rounded-md border border-neutral-800">
            <table class="w-full table-fixed border-collapse text-sm">
              <thead class="sticky top-0 bg-neutral-900/80 text-neutral-300">
                <tr>
                  <th v-if="lineNumbers" class="w-12 px-2 py-2 text-right font-medium">#</th>
                  <th class="w-1/2 px-2 py-2 text-left font-medium">Left</th>
                  <th v-if="lineNumbers" class="w-12 px-2 py-2 text-right font-medium">#</th>
                  <th class="w-1/2 px-2 py-2 text-left font-medium">Right</th>
                </tr>
              </thead>
              <tbody :class="wrap ? '' : 'whitespace-pre'">
                <tr
                  v-for="(row, i) in sideBySide"
                  :key="i"
                  class="border-t border-neutral-800 align-top"
                >
                  <td
                    v-if="lineNumbers"
                    class="px-2 py-1 text-right tabular-nums text-neutral-500"
                    >{{ row.ln ?? '' }}</td
                  >
                  <td class="px-2 py-1" :class="cellClass(row.tl)" v-html="row.lHtml" />
                  <td
                    v-if="lineNumbers"
                    class="px-2 py-1 text-right tabular-nums text-neutral-500"
                    >{{ row.rn ?? '' }}</td
                  >
                  <td class="px-2 py-1" :class="cellClass(row.tr)" v-html="row.rHtml" />
                </tr>
                <tr v-if="!sideBySide.length"
                  ><td :colspan="lineNumbers ? 4 : 2" class="px-3 py-6 text-center text-neutral-500"
                    >No differences</td
                  ></tr
                >
              </tbody>
            </table>
          </div>
          <p class="text-xs text-neutral-500"
            >Green = added, Red = removed. Yellow = word-level change.</p
          >
        </div>

        <div v-else class="grid gap-3">
          <div class="overflow-auto rounded-md border border-neutral-800">
            <pre :class="['p-3 text-sm leading-relaxed', wrap ? '' : 'whitespace-pre']">
<span v-for="(row,i) in unified" :key="i" :class="lineClass(row.t)">
<span v-if="lineNumbers" class="select-none text-neutral-400 tabular-nums mr-2">{{ row.ln ?? ' ' }}/{{ row.rn ?? ' ' }}</span><span v-html="row.html"></span>
</span>
              </pre>
          </div>
          <p class="text-xs text-neutral-500">Unified uses “+” and “−”.</p>
        </div>
      </div>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const left = ref('')
const right = ref('')
const mode = ref<'side' | 'unified'>('side')
const wrap = ref(true)
const lineNumbers = ref(true)
const opts = ref({ ignoreWs: true, trim: true, ignoreCase: false, wordLevel: true })

type Op = {
  t: 'eq' | 'add' | 'del'
  a?: string
  b?: string
  ai?: number | null
  bi?: number | null
}
const diffRows = ref<Op[]>([])
const stats = ref({ added: 0, removed: 0, unchanged: 0, time: 0 })

function normalizeBlock(s: string) {
  let v = s.replace(/\r\n?/g, '\n')
  if (opts.value.trim)
    v = v
      .split('\n')
      .map((l) => l.replace(/\s+$/, ''))
      .join('\n')
  return v
}
function keyOf(line: string) {
  let k = line
  if (opts.value.ignoreWs) k = k.replace(/\s+/g, ' ')
  if (opts.value.ignoreCase) k = k.toLowerCase()
  return k
}
function lcs(a: string[], b: string[]) {
  const n = a.length,
    m = b.length
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const ops: Op[] = []
  let i = 0,
    j = 0,
    ai = 0,
    bi = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ t: 'eq', ai: ai + 1, bi: bi + 1 })
      i++
      j++
      ai++
      bi++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ t: 'del', ai: ai + 1 })
      i++
      ai++
    } else {
      ops.push({ t: 'add', bi: bi + 1 })
      j++
      bi++
    }
  }
  while (i < n) {
    ops.push({ t: 'del', ai: ai + 1 })
    i++
    ai++
  }
  while (j < m) {
    ops.push({ t: 'add', bi: bi + 1 })
    j++
    bi++
  }
  return ops
}
function run() {
  const t0 = performance.now()
  const A = normalizeBlock(left.value).split('\n')
  const B = normalizeBlock(right.value).split('\n')
  const aKeys = A.map(keyOf),
    bKeys = B.map(keyOf)
  const ops = lcs(aKeys, bKeys)

  let ia = 0,
    ib = 0
  const out: Op[] = []
  for (const op of ops) {
    if (op.t === 'eq') {
      out.push({ t: 'eq', a: A[ia], b: B[ib], ai: op.ai, bi: op.bi })
      ia++
      ib++
    } else if (op.t === 'del') {
      out.push({ t: 'del', a: A[ia], ai: op.ai, bi: null })
      ia++
    } else {
      out.push({ t: 'add', b: B[ib], ai: null, bi: op.bi })
      ib++
    }
  }
  diffRows.value = out

  let added = 0,
    removed = 0,
    unchanged = 0
  for (const r of out) r.t === 'add' ? added++ : r.t === 'del' ? removed++ : unchanged++
  stats.value = { added, removed, unchanged, time: Math.max(0, Math.round(performance.now() - t0)) }
}

function esc(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  )
}
function wordTokens(s: string) {
  return s.split(/(\s+|[^\w\s]+)/g).filter(Boolean)
}
function wordHighlight(a: string, b: string, added: boolean) {
  if (!opts.value.wordLevel) return esc(added ? b : a)
  const src = added ? b : a
  const toks = wordTokens(src)
  return toks
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok
      if (/^[^\w\s]+$/.test(tok)) return esc(tok)
      return `<span class="${added ? 'bg-emerald-500/30 text-emerald-50' : 'bg-rose-500/30 text-rose-50'}">${esc(tok)}</span>`
    })
    .join('')
}
const sideBySide = computed(() => {
  return diffRows.value.map((r) => {
    if (r.t === 'eq')
      return {
        ln: r.ai ?? null,
        rn: r.bi ?? null,
        lHtml: esc(r.a || ''),
        rHtml: esc(r.b || ''),
        tl: 'eq',
        tr: 'eq',
      } as const
    if (r.t === 'del')
      return {
        ln: r.ai ?? null,
        rn: null,
        lHtml: wordHighlight(r.a || '', '', false),
        rHtml: '',
        tl: 'del',
        tr: null,
      } as const
    return {
      ln: null,
      rn: r.bi ?? null,
      lHtml: '',
      rHtml: wordHighlight('', r.b || '', true),
      tl: null,
      tr: 'add',
    } as const
  })
})
const unified = computed(() => {
  return diffRows.value.map((r) => {
    if (r.t === 'eq')
      return { t: 'eq', ln: r.ai ?? null, rn: r.bi ?? null, html: '  ' + esc(r.a || '') } as const
    if (r.t === 'del')
      return {
        t: 'del',
        ln: r.ai ?? null,
        rn: null,
        html: '− ' + (opts.value.wordLevel ? wordHighlight(r.a || '', '', false) : esc(r.a || '')),
      } as const
    return {
      t: 'add',
      ln: null,
      rn: r.bi ?? null,
      html: '+ ' + (opts.value.wordLevel ? wordHighlight('', r.b || '', true) : esc(r.b || '')),
    } as const
  })
})
function cellClass(t: 'eq' | 'add' | 'del' | null) {
  if (t === 'add') return 'bg-emerald-500/10 text-emerald-200'
  if (t === 'del') return 'bg-rose-500/10 text-rose-200'
  return 'text-neutral-200'
}
function lineClass(t: 'eq' | 'add' | 'del') {
  if (t === 'add') return 'bg-emerald-500/10 text-emerald-200'
  if (t === 'del') return 'bg-rose-500/10 text-rose-200'
  return ''
}
function stripHtml(s: string) {
  const d = document.createElement('div')
  d.innerHTML = s
  return d.textContent || ''
}
function copyUnified() {
  const lines = unified.value.map(
    (r) => (r.t === 'add' ? '+ ' : r.t === 'del' ? '- ' : '  ') + stripHtml(r.html)
  )
  navigator.clipboard.writeText(lines.join('\n')).catch(() => {})
}
function clearAll() {
  left.value = ''
  right.value = ''
  diffRows.value = []
  stats.value = { added: 0, removed: 0, unchanged: 0, time: 0 }
}

run()
</script>
