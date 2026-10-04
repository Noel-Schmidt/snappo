<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-5">
        <div class="grid gap-2">
          <Label>Operation</Label>
          <div class="flex gap-2" role="group" aria-label="HTML entity operation">
            <button
              v-for="item in modes"
              :key="item.value"
              type="button"
              class="focus-visible:outline-ring rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              :class="
                mode === item.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:bg-muted'
              "
              :aria-pressed="mode === item.value"
              @click="mode = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <div class="grid gap-2">
            <Label for="entity-input">Input</Label>
            <Textarea
              id="entity-input"
              v-model="input"
              rows="8"
              class="border-border bg-background min-h-48 w-full rounded-md border p-3 font-mono text-sm"
              :placeholder="
                mode === 'encode'
                  ? '<title>Tom & Jerry</title>'
                  : '&lt;title&gt;Tom &amp; Jerry&lt;/title&gt;'
              "
              spellcheck="false"
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-3">
              <Label for="entity-output">Result</Label>
              <Button size="sm" variant="outline" :disabled="!result" @click="copyResult"
                >Copy</Button
              >
            </div>
            <Textarea
              id="entity-output"
              :model-value="result"
              rows="8"
              readonly
              class="border-border bg-muted/30 min-h-48 w-full rounded-md border p-3 font-mono text-sm"
              aria-live="polite"
            />
            <p class="text-muted-foreground text-xs">
              {{
                input
                  ? 'Common named entities and numeric entities are supported.'
                  : 'Enter text to convert it.'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Escape HTML characters"
      intro="HTML entities represent characters such as ampersands and angle brackets in markup."
      detail="Encoding replaces ampersands, angle brackets, quotation marks, and apostrophes. Decoding supports common named entities and decimal or hexadecimal numeric entities."
      use-case="Escape plain text before placing it in an HTML text context, or inspect entity-encoded content."
    />
  </ToolLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import ToolLayout from '@/components/tool/toolLayout.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ToolExplanation from '~/components/tool/toolExplanation.vue'

type Mode = 'encode' | 'decode'
const modes: { value: Mode; label: string }[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]
const mode = ref<Mode>('encode')
const input = ref('')
const namedEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  copy: '©',
  gt: '>',
  lt: '<',
  nbsp: '\u00a0',
  quot: '"',
  reg: '®',
}

const result = computed(() => {
  if (mode.value === 'encode') {
    const escaped: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return input.value.replace(/[&<>"']/g, (character) => escaped[character])
  }

  return input.value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi, (entity, value: string) => {
    if (value[0] !== '#') return namedEntities[value.toLowerCase()] ?? entity
    const isHex = value[1]?.toLowerCase() === 'x'
    const point = Number.parseInt(value.slice(isHex ? 2 : 1), isHex ? 16 : 10)
    if (
      !Number.isInteger(point) ||
      point < 0 ||
      point > 0x10ffff ||
      (point >= 0xd800 && point <= 0xdfff)
    ) {
      return entity
    }
    return String.fromCodePoint(point)
  })
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value)
    toast('Result copied')
  } catch {
    toast('Could not copy result', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
