<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import JsonNode from './json/jsonNode.vue'
import JsonEditor from './json/jsonEditor.vue'

import ToolLayout from '@/components/tool/toolLayout.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type IndentOpt = '2' | '4' | 'tab'
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const input = ref('')
const output = ref('')
const error = ref('')
const indent = ref<IndentOpt>('2')
const sortKeys = ref(false)
const jsonc = ref(false)
const viewText = ref(false)
const parsed = ref<JsonValue | undefined>(undefined)
const isValid = ref(false)

const lineCount = computed(() => (input.value ? input.value.split('\n').length : 0))
const byteCount = computed(() => new TextEncoder().encode(input.value).length)
const statusLabel = computed(() => {
  if (!input.value.trim()) return 'Ready for JSON'
  return isValid.value ? 'Valid JSON' : 'Invalid JSON'
})

function looksBinary(source: string): boolean {
  let controls = 0
  for (let i = 0; i < source.length && i < 4096; i++) {
    const code = source.charCodeAt(i)
    if ((code >= 0 && code < 9) || (code > 13 && code < 32)) controls++
  }
  return controls > 8
}

function toIndent(value: IndentOpt): number | string {
  return value === 'tab' ? '\t' : Number(value)
}

function stripJsonc(source: string): string {
  let result = ''
  let inString = false
  let quote = ''
  let escaped = false

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (inString) {
      result += char
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) inString = false
      continue
    }
    if (char === '"' || char === "'") {
      inString = true
      quote = char
      result += char
    } else if (char === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      result += '\n'
    } else if (char === '/' && source[i + 1] === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++
      i++
    } else result += char
  }

  return result.replace(/,\s*([}\]])/g, '$1')
}

function sortObjectKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortObjectKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, sortObjectKeys(value[key])])
    )
  }
  return value
}

function formatError(source: string, cause: unknown): string {
  const message = String((cause as Error)?.message || cause)
  const position = /position (\d+)/i.exec(message)
  if (!position) return message

  const lines = source.slice(0, Number(position[1])).split('\n')
  return `${message} (line ${lines.length}, column ${lines[lines.length - 1].length + 1})`
}

function parseInput(): JsonValue {
  const source = jsonc.value ? stripJsonc(input.value) : input.value
  const value = JSON.parse(source) as JsonValue
  return sortKeys.value ? sortObjectKeys(value) : value
}

function updatePreview(): void {
  if (!input.value.trim()) {
    parsed.value = undefined
    output.value = ''
    error.value = ''
    isValid.value = false
    return
  }

  if (looksBinary(input.value)) {
    parsed.value = undefined
    output.value = ''
    error.value = 'Input looks like binary data. Please paste UTF-8 JSON.'
    isValid.value = false
    return
  }

  try {
    const value = parseInput()
    parsed.value = value
    output.value = JSON.stringify(value, null, toIndent(indent.value))
    error.value = ''
    isValid.value = true
  } catch (cause) {
    parsed.value = undefined
    output.value = ''
    error.value = formatError(jsonc.value ? stripJsonc(input.value) : input.value, cause)
    isValid.value = false
  }
}

watch([input, indent, sortKeys, jsonc], updatePreview, { immediate: true })

function formatInput(): void {
  updatePreview()
  if (!isValid.value) return
  input.value = JSON.stringify(parsed.value, null, toIndent(indent.value))
}

function formatAfterPaste(): void {
  window.setTimeout(formatInput, 0)
}

function minify(): void {
  if (!isValid.value) return
  output.value = JSON.stringify(parsed.value)
}

function validate(): void {
  updatePreview()
  if (isValid.value) toast('Valid JSON')
}

function clearAll(): void {
  input.value = ''
}

async function copyOutput(): Promise<void> {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    toast('Output copied')
  } catch {
    toast('Could not copy output')
  }
}

function downloadOutput(): void {
  if (!output.value) return
  const url = URL.createObjectURL(
    new Blob([output.value], { type: 'application/json;charset=utf-8' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'data.json'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <ToolLayout>
    <div class="space-y-12">
      <div class="space-y-6">
        <div
          class="border-border flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-6"
        >
          <p class="text-muted-foreground text-sm">Format JSON directly in the input field.</p>
          <div class="flex items-center gap-2 text-sm" aria-live="polite">
            <span
              class="size-2 rounded-full"
              :class="
                isValid
                  ? 'bg-emerald-500'
                  : input.trim()
                    ? 'bg-amber-500'
                    : 'bg-muted-foreground/50'
              "
              aria-hidden="true"
            />
            <span
              :class="isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div
          class="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6"
        >
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" :disabled="!isValid" @click="formatInput">Format input</Button>
            <Button size="sm" variant="outline" :disabled="!isValid" @click="minify"
              >Minify preview</Button
            >
            <Button size="sm" variant="ghost" @click="validate">Validate</Button>
            <Button size="sm" variant="ghost" :disabled="!input" @click="clearAll">Clear</Button>
          </div>
          <div class="flex items-center gap-2">
            <Label for="indent" class="text-muted-foreground text-xs">Indentation</Label>
            <Select v-model="indent">
              <SelectTrigger id="indent" class="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="tab">Tabs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid min-h-[560px] lg:grid-cols-2">
          <div class="border-border flex min-w-0 flex-col border-b lg:border-b-0 lg:border-r">
            <div class="flex items-center justify-between px-5 pb-3 pt-4 sm:px-6">
              <div class="flex items-center gap-2">
                <Label for="json-input" class="text-sm font-medium">Input</Label>
                <span v-if="error" class="text-destructive text-xs" role="status"
                  >Invalid JSON</span
                >
              </div>
              <span class="text-muted-foreground text-xs">
                {{ lineCount }} lines · {{ byteCount }} bytes
              </span>
            </div>
            <JsonEditor
              v-model="input"
              :indent="indent"
              :jsonc="jsonc"
              @blur="formatInput"
              @paste="formatAfterPaste"
            />
            <div
              class="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 sm:px-6"
            >
              <p id="input-help" class="text-muted-foreground text-xs">
                Valid JSON is formatted when you leave the editor.
              </p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                <label class="flex items-center gap-2 text-xs">
                  <Switch v-model:checked="jsonc" aria-label="Allow JSONC" />
                  Allow JSONC
                </label>
                <label class="flex items-center gap-2 text-xs">
                  <Switch v-model:checked="sortKeys" aria-label="Sort object keys" />
                  Sort keys
                </label>
              </div>
            </div>
          </div>

          <div class="flex min-w-0 flex-col">
            <div
              class="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 sm:px-6"
            >
              <div class="flex items-center gap-3">
                <Label class="text-sm font-medium">Preview</Label>
                <span v-if="isValid" class="text-muted-foreground text-xs">
                  {{ output.length }} characters
                </span>
              </div>
              <div class="flex items-center gap-1">
                <label class="mr-2 flex items-center gap-2 text-xs">
                  <Switch v-model:checked="viewText" aria-label="Show formatted text" />
                  Text
                </label>
                <Button size="sm" variant="ghost" :disabled="!output" @click="copyOutput"
                  >Copy</Button
                >
                <Button size="sm" variant="ghost" :disabled="!output" @click="downloadOutput"
                  >Download</Button
                >
              </div>
            </div>

            <div class="min-h-[400px] flex-1 overflow-auto p-5 sm:p-6">
              <Textarea
                v-if="viewText && isValid"
                :model-value="output"
                readonly
                class="focus-visible:ring-ring min-h-[380px] resize-y border-0 bg-transparent p-0 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-2"
                aria-label="Formatted JSON output"
              />
              <div
                v-else-if="isValid && parsed !== undefined"
                class="font-mono text-[13px] leading-6"
              >
                <JsonNode :v="parsed" :root-open="true" @copy="toast('Value copied')" />
              </div>
              <div
                v-else-if="error"
                class="border-destructive/40 bg-destructive/5 rounded-md border p-4"
                role="alert"
              >
                <p class="text-destructive text-sm font-medium">Syntax error</p>
                <p class="text-muted-foreground mt-1 break-words font-mono text-xs">{{ error }}</p>
              </div>
              <div
                v-else
                class="text-muted-foreground flex min-h-[340px] flex-col items-center justify-center gap-3 text-center"
              >
                <span class="font-mono text-3xl opacity-50" aria-hidden="true">{ }</span>
                <p class="text-sm">Your formatted JSON preview will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <tool-explanation
        title="JSON formatter and validator"
        intro="JSON is a text format for structured data. The formatter checks your input as you type and shows valid JSON in a readable layout."
        detail="Choose indentation, sort object keys, or allow JSONC comments and trailing commas. Processing stays in your browser."
        use-case="Inspect API responses, configuration files, and structured data while developing."
      />
    </div>
  </ToolLayout>
</template>
