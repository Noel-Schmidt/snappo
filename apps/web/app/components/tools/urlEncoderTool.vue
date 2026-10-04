<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-6">
        <div class="grid gap-2">
          <Label>Operation</Label>
          <div class="flex flex-wrap gap-2" role="group" aria-label="URL operation">
            <button
              v-for="option in operations"
              :key="option.value"
              type="button"
              class="focus-visible:outline-ring rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              :class="
                operation === option.value
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:bg-muted'
              "
              :aria-pressed="operation === option.value"
              @click="operation = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <p class="text-muted-foreground text-sm">
            {{
              operation === 'component'
                ? 'Use for a query parameter or another single URL value.'
                : 'Use for a complete URL while keeping its separators readable.'
            }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="grid content-start gap-2">
            <Label for="url-input">Input</Label>
            <Textarea
              id="url-input"
              v-model="input"
              rows="9"
              class="border-border bg-background min-h-56 w-full resize-y rounded-md border p-3 font-mono text-sm"
              :placeholder="
                operation === 'component'
                  ? 'search term: coffee & tea'
                  : 'https://example.com/search?q=coffee & tea'
              "
              spellcheck="false"
            />
          </div>
          <div class="grid content-start gap-2">
            <div class="flex items-center justify-between gap-3">
              <Label for="url-output">Result</Label>
              <Button variant="outline" size="sm" :disabled="!result.value" @click="copyResult">
                Copy
              </Button>
            </div>
            <Textarea
              id="url-output"
              :model-value="result.value"
              rows="9"
              readonly
              class="border-border bg-muted/30 min-h-56 w-full resize-y rounded-md border p-3 font-mono text-sm"
              aria-live="polite"
            />
            <p v-if="result.error" class="text-destructive text-sm" role="alert">
              {{ result.error }}
            </p>
            <p v-else class="text-muted-foreground text-xs" aria-live="polite">
              {{ input ? 'Processed locally in your browser.' : 'Enter text to see the result.' }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Encode URL text safely"
      intro="Percent encoding replaces characters that have a special meaning in a URL with a percent sign and a byte value."
      detail="Choose single-value mode for query values and full-URL mode when you want to preserve URL separators such as slashes and question marks. Decoding reports malformed percent sequences as an error."
      use-case="Prepare user input for a query parameter, or inspect an encoded link while debugging a request."
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

type Operation = 'component' | 'url' | 'decode-component' | 'decode-url'

const operations: { value: Operation; label: string }[] = [
  { value: 'component', label: 'Encode value' },
  { value: 'url', label: 'Encode full URL' },
  { value: 'decode-component', label: 'Decode value' },
  { value: 'decode-url', label: 'Decode full URL' },
]

const operation = ref<Operation>('component')
const input = ref('')

const result = computed(() => {
  if (!input.value) return { value: '', error: '' }

  try {
    const value =
      operation.value === 'component'
        ? encodeURIComponent(input.value)
        : operation.value === 'url'
          ? encodeURI(input.value)
          : operation.value === 'decode-component'
            ? decodeURIComponent(input.value)
            : decodeURI(input.value)

    return { value, error: '' }
  } catch {
    return { value: '', error: 'The input contains an invalid percent-encoded sequence.' }
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
