<template>
  <tool-layout>
    <div class="space-y-6">
      <div class="grid gap-8">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="grid gap-2">
            <Label for="left">Left</Label>
            <Textarea
              id="left"
              v-model="left"
              rows="10"
              class="border-border bg-background text-foreground focus:ring-ring w-full rounded-md border p-3 text-sm outline-none focus:ring-2"
              placeholder="Paste original text"
            />
          </div>
          <div class="grid gap-2">
            <Label for="right">Right</Label>
            <Textarea
              id="right"
              v-model="right"
              rows="10"
              class="border-border bg-background text-foreground focus:ring-ring w-full rounded-md border p-3 text-sm outline-none focus:ring-2"
              placeholder="Paste changed text"
            />
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div class="grid gap-3">
            <Label>Options</Label>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Ignore whitespace</span
              ><Switch v-model:checked="opts.ignoreWs"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Trim line ends</span
              ><Switch v-model:checked="opts.trim"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Ignore case</span
              ><Switch v-model:checked="opts.ignoreCase"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Word highlights</span
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
                class="h-11 px-5"
                >Side-by-Side</Button
              >
              <Button
                :variant="mode === 'unified' ? 'default' : 'outline'"
                size="sm"
                @click="mode = 'unified'"
                class="h-11 px-5"
                >Unified</Button
              >
            </div>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Wrap long lines</span
              ><Switch v-model:checked="wrap"
            /></div>
            <div class="flex items-center justify-between"
              ><span class="text-foreground/80 text-sm">Show line numbers</span
              ><Switch v-model:checked="lineNumbers"
            /></div>
            <div class="flex flex-wrap gap-2">
              <Button :disabled="!left && !right" @click="run" class="h-11 px-5">Compare</Button>
              <Button
                variant="outline"
                :disabled="!left && !right"
                @click="clearAll"
                class="h-11 px-5"
                >Clear</Button
              >
              <Button
                variant="outline"
                :disabled="!unified.length"
                @click="copyUnified"
                class="h-11 px-5"
                >Copy unified</Button
              >
            </div>
          </div>

          <div class="grid gap-3">
            <Label>Summary</Label>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="border-input bg-muted text-foreground rounded-md border px-2 py-1"
                >+ {{ stats.added }} added</span
              >
              <span class="border-input bg-muted text-foreground rounded-md border px-2 py-1"
                >− {{ stats.removed }} removed</span
              >
              <span class="border-input bg-muted text-foreground rounded-md border px-2 py-1"
                >= {{ stats.unchanged }} unchanged</span
              >
              <span class="border-input bg-muted text-foreground rounded-md border px-2 py-1"
                >{{ stats.time }} ms</span
              >
            </div>
          </div>
        </div>

        <div class="bg-border h-px w-full"></div>

        <div v-if="mode === 'side'" class="grid gap-3">
          <div class="border-border overflow-auto rounded-md border">
            <table class="w-full table-fixed border-collapse text-sm">
              <thead class="bg-muted text-foreground/80 sticky top-0">
                <tr>
                  <th v-if="lineNumbers" class="w-12 px-2 py-2 text-right font-medium">#</th>
                  <th class="w-1/2 px-2 py-2 text-left font-medium">Left</th>
                  <th v-if="lineNumbers" class="w-12 px-2 py-2 text-right font-medium">#</th>
                  <th class="w-1/2 px-2 py-2 text-left font-medium">Right</th>
                </tr>
              </thead>
              <tbody :class="wrap ? '' : 'whitespace-pre'">
                <tr v-for="(row, i) in sideRows" :key="i" class="border-border border-t align-top">
                  <td
                    v-if="lineNumbers"
                    class="text-muted-foreground px-2 py-1 text-right tabular-nums"
                    >{{ row.ln ?? '' }}</td
                  >
                  <td class="px-2 py-1" :class="cellClass(row.tl)" v-html="row.lHtml"></td>
                  <td
                    v-if="lineNumbers"
                    class="text-muted-foreground px-2 py-1 text-right tabular-nums"
                    >{{ row.rn ?? '' }}</td
                  >
                  <td class="px-2 py-1" :class="cellClass(row.tr)" v-html="row.rHtml"></td>
                </tr>
                <tr v-if="!sideRows.length"
                  ><td
                    :colspan="lineNumbers ? 4 : 2"
                    class="text-muted-foreground px-3 py-6 text-center"
                    >No differences</td
                  ></tr
                >
              </tbody>
            </table>
          </div>
          <p class="text-muted-foreground text-xs"
            >Green = added, Red = removed. Yellow marks changed words.</p
          >
        </div>

        <div v-else class="grid gap-3">
          <div class="border-border overflow-auto rounded-md border">
            <pre :class="['p-3 text-sm leading-relaxed', wrap ? '' : 'whitespace-pre']">
<span v-for="(row,i) in unified" :key="i" :class="lineClass(row.t)">
<span v-if="lineNumbers" class="select-none mr-2 tabular-nums text-muted-foreground">{{ row.ln ?? ' ' }}/{{ row.rn ?? ' ' }}</span><span v-html="row.html"></span>
</span>
              </pre>
          </div>
          <p class="text-muted-foreground text-xs">Unified uses “+” and “−”.</p>
        </div>
      </div>
    </div>
    <tool-explanation
      title="Text and code diff checker"
      intro="A diff compares two versions of text and marks what was added, removed or changed. It is useful for reviewing edits in source code, configuration and documents."
      detail="Paste the original and updated versions to see their differences. The available views present the changes in different layouts so you can inspect either the overall result or individual lines."
      use-case="Compare drafts, code snippets, settings files or copied outputs before replacing the original."
    />
  </tool-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

const left = ref(''),
  right = ref('')
const mode = ref<'side' | 'unified'>('side')
const wrap = ref(true),
  lineNumbers = ref(true)
const opts = ref({ ignoreWs: true, trim: true, ignoreCase: false, wordLevel: true })

type Op = {
  type: 'eq' | 'add' | 'del'
  a?: string
  b?: string
  ai?: number | null
  bi?: number | null
}
const ops = ref<Op[]>([])
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

function lcsLines(aKeys: string[], bKeys: string[], A: string[], B: string[]) {
  const n = aKeys.length,
    m = bKeys.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = aKeys[i] === bKeys[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: Op[] = []
  let i = 0,
    j = 0,
    ai = 0,
    bi = 0
  while (i < n && j < m) {
    if (aKeys[i] === bKeys[j]) {
      out.push({ type: 'eq', a: A[i], b: B[j], ai: ai + 1, bi: bi + 1 })
      i++
      j++
      ai++
      bi++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'del', a: A[i], ai: ai + 1, bi: null })
      i++
      ai++
    } else {
      out.push({ type: 'add', b: B[j], ai: null, bi: bi + 1 })
      j++
      bi++
    }
  }
  while (i < n) {
    out.push({ type: 'del', a: A[i], ai: ai + 1, bi: null })
    i++
    ai++
  }
  while (j < m) {
    out.push({ type: 'add', b: B[j], ai: null, bi: bi + 1 })
    j++
    bi++
  }
  return out
}

function run() {
  const t0 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
  const A = normalizeBlock(left.value).split('\n')
  const B = normalizeBlock(right.value).split('\n')
  const aKeys = A.map(keyOf),
    bKeys = B.map(keyOf)
  ops.value = lcsLines(aKeys, bKeys, A, B)
  let added = 0,
    removed = 0,
    unchanged = 0
  for (const r of ops.value) r.type === 'add' ? added++ : r.type === 'del' ? removed++ : unchanged++
  const t1 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
  stats.value = { added, removed, unchanged, time: Math.max(0, Math.round(t1 - t0)) }
}

function esc(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
  )
}
function tokenize(s: string) {
  return s.split(/(\s+|[^\w\s]+)/g).filter(Boolean)
}

type TokOp = { t: 'eq' | 'add' | 'del'; v: string }
function diffTokens(a: string[], b: string[]) {
  const n = a.length,
    m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: TokOp[] = []
  let i = 0,
    j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ t: 'eq', v: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ t: 'del', v: a[i++] })
    } else {
      out.push({ t: 'add', v: b[j++] })
    }
  }
  while (i < n) out.push({ t: 'del', v: a[i++] })
  while (j < m) out.push({ t: 'add', v: b[j++] })
  return out
}

function renderLeft(a: string, b: string) {
  if (!opts.value.wordLevel) return esc(a)
  const ops = diffTokens(tokenize(a), tokenize(b))
  return ops
    .map((o) => {
      if (o.t === 'eq') return esc(o.v)
      if (o.t === 'del') return `<span class="bg-rose-500/30 text-rose-50">${esc(o.v)}</span>`
      return ''
    })
    .join('')
}
function renderRight(a: string, b: string) {
  if (!opts.value.wordLevel) return esc(b)
  const ops = diffTokens(tokenize(a), tokenize(b))
  return ops
    .map((o) => {
      if (o.t === 'eq') return esc(o.v)
      if (o.t === 'add') return `<span class="bg-emerald-500/30 text-emerald-50">${esc(o.v)}</span>`
      return ''
    })
    .join('')
}

const sideRows = computed(() => {
  const rows: {
    ln: number | null
    rn: number | null
    lHtml: string
    rHtml: string
    tl: 'eq' | 'add' | 'del' | null
    tr: 'eq' | 'add' | 'del' | null
  }[] = []

  for (let i = 0; i < ops.value.length; i++) {
    const op = ops.value[i]

    if (op.type === 'eq') {
      rows.push({
        ln: op.ai ?? null,
        rn: op.bi ?? null,
        lHtml: esc(op.a || ''),
        rHtml: esc(op.b || ''),
        tl: 'eq',
        tr: 'eq',
      })
      continue
    }

    if (op.type === 'del' && ops.value[i + 1]?.type === 'add') {
      const nxt = ops.value[i + 1]
      rows.push({
        ln: op.ai ?? null,
        rn: nxt.bi ?? null,
        lHtml: renderLeft(op.a || '', nxt.b || ''),
        rHtml: renderRight(op.a || '', nxt.b || ''),
        tl: 'del',
        tr: 'add',
      })
      i++
      continue
    }

    if (op.type === 'del') {
      rows.push({
        ln: op.ai ?? null,
        rn: null,
        lHtml: renderLeft(op.a || '', ''),
        rHtml: '',
        tl: 'del',
        tr: null,
      })
      continue
    }

    if (op.type === 'add') {
      rows.push({
        ln: null,
        rn: op.bi ?? null,
        lHtml: '',
        rHtml: renderRight('', op.b || ''),
        tl: null,
        tr: 'add',
      })
    }
  }

  return rows
})

const unified = computed(() => {
  return ops.value.map((r) => {
    if (r.type === 'eq')
      return { t: 'eq' as const, ln: r.ai ?? null, rn: r.bi ?? null, html: '  ' + esc(r.a || '') }
    if (r.type === 'del')
      return { t: 'del' as const, ln: r.ai ?? null, rn: null, html: '− ' + esc(r.a || '') }
    return { t: 'add' as const, ln: null, rn: r.bi ?? null, html: '+ ' + esc(r.b || '') }
  })
})

function cellClass(t: 'eq' | 'add' | 'del' | null) {
  if (t === 'add') return 'bg-emerald-500/10 text-emerald-200'
  if (t === 'del') return 'bg-rose-500/10 text-rose-200'
  return 'text-foreground'
}
function lineClass(t: 'eq' | 'add' | 'del') {
  if (t === 'add') return 'bg-emerald-500/10 text-emerald-200'
  if (t === 'del') return 'bg-rose-500/10 text-rose-200'
  return ''
}

function clearAll() {
  left.value = ''
  right.value = ''
  ops.value = []
  stats.value = { added: 0, removed: 0, unchanged: 0, time: 0 }
}
function copyUnified() {
  const text = unified.value
    .map(
      (r) => (r.t === 'add' ? '+ ' : r.t === 'del' ? '- ' : '  ') + r.html.replace(/<[^>]+>/g, '')
    )
    .join('\n')
  navigator.clipboard.writeText(text).catch(() => {})
}

run()
</script>
