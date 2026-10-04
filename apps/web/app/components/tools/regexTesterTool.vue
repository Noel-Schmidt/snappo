<template>
  <section class="bg-background text-foreground py-10 sm:py-14">
    <div class="mx-auto max-w-7xl space-y-8 px-6">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-5">
          <div class="grid gap-2">
            <Label for="regex-pattern">Pattern</Label>
            <div
              class="border-input bg-card focus-within:ring-ring flex h-12 items-center rounded-md border px-3 focus-within:ring-2"
            >
              <span class="text-muted-foreground mr-2 font-mono">/</span>
              <Input
                id="regex-pattern"
                v-model="pattern"
                class="h-10 border-0 px-0 font-mono shadow-none focus-visible:ring-0"
                placeholder="([\w.-]+)@([\w.-]+\.\w+)"
                spellcheck="false"
                autocomplete="off"
                aria-describedby="regex-status"
              />
              <span class="text-muted-foreground ml-2 font-mono">/{{ flagString }}</span>
            </div>
            <p
              id="regex-status"
              class="min-h-5 text-sm"
              :class="error ? 'text-destructive' : 'text-muted-foreground'"
              aria-live="polite"
            >
              {{ error || statusText }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span class="text-sm font-medium">Flags</span>
            <label
              v-for="flag in flagOptions"
              :key="flag.key"
              class="flex items-center gap-2 text-sm"
            >
              <Switch
                v-model:checked="flags[flag.key]"
                :aria-label="`${flag.key}: ${flag.label}`"
              />
              <span class="font-mono">{{ flag.key }}</span>
              <span class="text-muted-foreground">{{ flag.label }}</span>
            </label>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-3">
              <Label for="regex-input">Test text</Label>
              <span class="text-muted-foreground text-xs">{{ text.length }} characters</span>
            </div>
            <Textarea
              id="regex-input"
              v-model="text"
              class="min-h-56 resize-y font-mono text-sm leading-6"
              placeholder="Paste or type text to test your pattern"
              spellcheck="false"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 text-sm">
              <Switch v-model:checked="replaceMode" aria-label="Toggle replace mode" />
              Replace mode
            </label>
            <Input
              v-if="replaceMode"
              v-model="replacement"
              class="h-10 min-w-56 flex-1 font-mono"
              placeholder="Replacement, for example $1"
              aria-label="Replacement text"
            />
            <span class="text-muted-foreground ml-auto text-sm">
              {{ result.matches.length }} {{ result.matches.length === 1 ? 'match' : 'matches' }}
              <template v-if="result.matches.length"> · {{ result.elapsed }} ms</template>
            </span>
            <Button variant="outline" :disabled="!result.matches.length" @click="copyResult">
              {{ copied ? 'Copied' : replaceMode ? 'Copy replacement' : 'Copy matches' }}
            </Button>
            <Button variant="ghost" :disabled="!pattern && !text && !replacement" @click="clearAll">
              Clear
            </Button>
          </div>
        </div>

        <aside
          class="border-border space-y-3 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <h2 class="text-sm font-semibold">Quick patterns</h2>
          <p class="text-muted-foreground text-sm">Choose an example to load it into the tester.</p>
          <div class="flex flex-wrap gap-2 lg:flex-col lg:items-start">
            <Button
              v-for="example in examples"
              :key="example.name"
              variant="outline"
              size="sm"
              class="h-auto max-w-full justify-start whitespace-normal py-2 text-left"
              @click="loadExample(example.pattern, example.sample)"
            >
              {{ example.name }}
            </Button>
          </div>
        </aside>
      </div>

      <div class="border-border grid gap-8 border-t pt-6 lg:grid-cols-2">
        <section class="min-w-0 space-y-3" aria-labelledby="preview-title">
          <div class="flex items-baseline justify-between gap-3">
            <h2 id="preview-title" class="font-semibold">Preview</h2>
            <span class="text-muted-foreground text-xs">Matched text is highlighted</span>
          </div>
          <div
            class="border-border bg-card min-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border p-4 font-mono text-sm leading-6"
            aria-live="polite"
            v-html="highlighted"
          />
        </section>

        <section class="min-w-0 space-y-3" aria-labelledby="matches-title">
          <div class="flex items-baseline justify-between gap-3">
            <h2 id="matches-title" class="font-semibold">Matches</h2>
            <span class="text-muted-foreground text-xs">Index starts at 0</span>
          </div>
          <div
            v-if="result.matches.length"
            class="border-border divide-border max-h-80 divide-y overflow-auto rounded-md border"
          >
            <article
              v-for="(match, index) in result.matches"
              :key="`${match.index}-${index}`"
              class="grid gap-2 p-3 sm:grid-cols-[3rem_minmax(0,1fr)]"
            >
              <span class="text-muted-foreground text-xs">{{ index + 1 }} · {{ match.index }}</span>
              <div class="min-w-0 space-y-2">
                <code class="block break-all text-sm">{{ match.value || '(empty match)' }}</code>
                <dl v-if="match.groups.length" class="flex flex-wrap gap-x-4 gap-y-1">
                  <div
                    v-for="(group, groupIndex) in match.groups"
                    :key="`${group.name || groupIndex}-${groupIndex}`"
                    class="flex min-w-0 gap-1 text-xs"
                  >
                    <dt class="text-muted-foreground shrink-0">{{
                      group.name || `$${groupIndex + 1}`
                    }}</dt>
                    <dd class="break-all">{{ group.value ?? 'undefined' }}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <p
            v-else-if="!pattern || !text"
            class="text-muted-foreground border-border rounded-md border border-dashed p-4 text-sm"
          >
            Enter a pattern and test text to see the matches here.
          </p>
          <p
            v-else
            class="text-muted-foreground border-border rounded-md border border-dashed p-4 text-sm"
            aria-live="polite"
          >
            No matches. Try changing the pattern or flags.
          </p>

          <div v-if="replaceMode" class="space-y-2 pt-2">
            <Label for="regex-replaced">Replacement preview</Label>
            <Textarea
              id="regex-replaced"
              :value="result.replaced"
              readonly
              class="min-h-32 resize-y font-mono text-sm"
            />
          </div>
        </section>
      </div>

      <ToolExplanation
        title="Regular expression tester"
        intro="Build a JavaScript regular expression and see its matches, capture groups, and replacement output against sample text."
        detail="Results update as you edit. Matching runs in your browser. The g flag finds every match, i ignores case, m changes line anchors, s lets a dot match line breaks, u enables Unicode matching, and y requires a match at the current position."
        use-case="Use it to inspect a pattern against sample input before using it in JavaScript."
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const flagOptions = [
  { key: 'g', label: 'all matches' },
  { key: 'i', label: 'ignore case' },
  { key: 'm', label: 'line anchors' },
  { key: 's', label: 'dot matches line breaks' },
  { key: 'u', label: 'Unicode' },
  { key: 'y', label: 'sticky' },
] as const

type Flag = (typeof flagOptions)[number]['key']
type Capture = { name?: string; value: string | undefined }
type Match = { value: string; index: number; groups: Capture[] }

const examples = [
  {
    name: 'Email addresses',
    pattern: '([\\w.+-]+)@([\\w.-]+\\.[a-zA-Z]{2,})',
    sample: 'Write to hello@example.com or team@snappo.dev.',
  },
  {
    name: 'URLs',
    pattern: 'https?://[^\\s]+',
    sample: 'Docs: https://developer.mozilla.org/ and https://example.com/path?q=1',
  },
  {
    name: 'Repeated words',
    pattern: '\\b(\\w+)\\s+\\1\\b',
    sample: 'This is is a small regex example.',
  },
] as const

const pattern = ref('')
const text = ref('')
const replacement = ref('')
const replaceMode = ref(false)
const copied = ref(false)
const flags = ref<Record<Flag, boolean>>({
  g: true,
  i: false,
  m: false,
  s: false,
  u: false,
  y: false,
})
const flagString = computed(() =>
  flagOptions
    .filter(({ key }) => flags.value[key])
    .map(({ key }) => key)
    .join('')
)

const result = computed(() => {
  if (!pattern.value) return { matches: [] as Match[], error: '', elapsed: 0, replaced: text.value }

  let expression: RegExp
  try {
    expression = new RegExp(pattern.value, flagString.value)
  } catch (cause) {
    return {
      matches: [] as Match[],
      error: cause instanceof Error ? cause.message : 'Invalid regular expression',
      elapsed: 0,
      replaced: text.value,
    }
  }

  const start = performance.now()
  const matches: Match[] = []
  let match: RegExpExecArray | null
  while ((match = expression.exec(text.value)) !== null) {
    const captures = match.slice(1).map((value) => ({ value }))
    if (match.groups) {
      for (const [name, value] of Object.entries(match.groups)) captures.push({ name, value })
    }
    matches.push({ value: match[0], index: match.index, groups: captures })
    if (!expression.global && !expression.sticky) break
    if (match[0] === '') expression.lastIndex += 1
  }

  let replaced = text.value
  try {
    replaced = text.value.replace(new RegExp(pattern.value, flagString.value), replacement.value)
  } catch {
    // The constructor above already reports malformed patterns.
  }

  return { matches, error: '', elapsed: Math.round(performance.now() - start), replaced }
})

const error = computed(() => result.value.error)
const statusText = computed(() => {
  if (!pattern.value) return 'Enter a pattern to inspect matches.'
  if (!text.value) return 'Pattern is valid. Add test text to see matches.'
  return `${result.value.matches.length} ${result.value.matches.length === 1 ? 'match' : 'matches'} found.`
})

const highlighted = computed(() => {
  const source = text.value
  const spans: string[] = []
  let cursor = 0
  for (const match of result.value.matches) {
    const end = match.index + match.value.length
    if (match.index < cursor) continue
    spans.push(escapeHtml(source.slice(cursor, match.index)))
    if (match.value.length) {
      spans.push(
        `<mark class="rounded-sm bg-primary/15 px-0.5 text-foreground">${escapeHtml(match.value)}</mark>`
      )
    }
    cursor = end
  }
  spans.push(escapeHtml(source.slice(cursor)))
  return (
    spans.join('') ||
    '<span class="text-muted-foreground">Your text preview will appear here.</span>'
  )
})

watch([pattern, text, replacement, flagString, replaceMode], () => {
  copied.value = false
})

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] as string
  )
}

function loadExample(nextPattern: string, sample: string) {
  pattern.value = nextPattern
  text.value = sample
}

function clearAll() {
  pattern.value = ''
  text.value = ''
  replacement.value = ''
}

async function copyResult() {
  const value = replaceMode.value
    ? result.value.replaced
    : result.value.matches
        .map((match, index) => `${index + 1}. ${JSON.stringify(match.value)} at ${match.index}`)
        .join('\n')
  try {
    await navigator.clipboard.writeText(value)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>
