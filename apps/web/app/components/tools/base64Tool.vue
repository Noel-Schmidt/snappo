<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-5">
        <div class="grid gap-2">
          <Label>Operation</Label>
          <div class="flex gap-2" role="group" aria-label="Base64 operation">
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
            <Label for="base64-input">Input</Label>
            <Textarea
              id="base64-input"
              v-model="input"
              rows="8"
              class="border-border bg-background min-h-48 w-full rounded-md border p-3 font-mono text-sm"
              :placeholder="mode === 'encode' ? 'Text to encode' : 'VGhpcyBpcyBCYXNlNjQ='"
              spellcheck="false"
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-3">
              <Label for="base64-output">Result</Label>
              <Button size="sm" variant="outline" :disabled="!result.value" @click="copyResult"
                >Copy</Button
              >
            </div>
            <Textarea
              id="base64-output"
              :model-value="result.value"
              rows="8"
              readonly
              class="border-border bg-muted/30 min-h-48 w-full rounded-md border p-3 font-mono text-sm"
              aria-live="polite"
            />
            <p v-if="result.error" class="text-destructive text-sm" role="alert">{{
              result.error
            }}</p>
            <p v-else class="text-muted-foreground text-xs">
              {{
                input
                  ? 'UTF-8 text is processed locally in your browser.'
                  : 'Enter text to convert it.'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Base64 encodes bytes as text"
      intro="Base64 represents binary data with printable characters. It is an encoding format, not encryption."
      detail="This tool converts UTF-8 text. Decoding rejects invalid Base64 and byte sequences that are not valid UTF-8."
      use-case="Inspect encoded text from APIs, email payloads, or configuration files."
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

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }
  try {
    if (mode.value === 'encode') {
      const bytes = new TextEncoder().encode(input.value)
      let binary = ''
      for (let offset = 0; offset < bytes.length; offset += 8192) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
      }
      return { value: btoa(binary), error: '' }
    }

    const normalized = input.value.replace(/\s/g, '')
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
      return { value: '', error: 'Enter valid Base64 text.' }
    }
    const binary = atob(normalized)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return { value: new TextDecoder('utf-8', { fatal: true }).decode(bytes), error: '' }
  } catch {
    return { value: '', error: 'The input could not be decoded as UTF-8 Base64.' }
  }
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value.value)
    toast('Result copied')
  } catch {
    toast('Could not copy result', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
