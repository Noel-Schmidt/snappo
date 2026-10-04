<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-5 md:grid-cols-2">
        <div class="grid gap-2">
          <Label for="csv-input">CSV input</Label>
          <Textarea
            id="csv-input"
            v-model="input"
            rows="12"
            class="border-border bg-background min-h-64 w-full rounded-md border p-3 font-mono text-sm"
            placeholder="name,city&#10;Ada,London&#10;Grace,New York"
            spellcheck="false"
          />
          <p class="text-muted-foreground text-xs"
            >The first row supplies JSON property names. Commas inside quoted cells are
            supported.</p
          >
        </div>
        <div class="grid content-start gap-2">
          <div class="flex items-center justify-between gap-3">
            <Label for="csv-output">JSON result</Label>
            <Button size="sm" variant="outline" :disabled="!result.value" @click="copyResult"
              >Copy</Button
            >
          </div>
          <Textarea
            id="csv-output"
            :model-value="result.value"
            rows="12"
            readonly
            class="border-border bg-muted/30 min-h-64 w-full rounded-md border p-3 font-mono text-sm"
            aria-live="polite"
          />
          <p v-if="result.error" class="text-destructive text-sm" role="alert">{{
            result.error
          }}</p>
          <p v-else class="text-muted-foreground text-xs">
            {{
              input
                ? `${result.rows} data row${result.rows === 1 ? '' : 's'} converted locally.`
                : 'Paste CSV data to convert it.'
            }}
          </p>
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Convert CSV rows to JSON"
      intro="CSV stores table data as delimited text. This converter uses the first row as object keys and each following row as a JSON object."
      detail="Quoted cells may contain commas, quotes, or line breaks. Every data row must have the same number of columns as the header row. Values remain strings."
      use-case="Turn a small exported table into JSON for a fixture, API request, or development task."
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

const input = ref('')

function parseCsv(source: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let afterQuote = false

  for (let index = 0; index < source.length; index++) {
    const character = source[index]
    if (inQuotes) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"'
        index++
      } else if (character === '"') {
        inQuotes = false
        afterQuote = true
      } else {
        field += character
      }
      continue
    }

    if (afterQuote && character !== ',' && character !== '\r' && character !== '\n') {
      throw new Error('Unexpected text after a quoted CSV value.')
    }
    if (character === '"' && field.length === 0 && !afterQuote) {
      inQuotes = true
    } else if (character === ',') {
      row.push(field)
      field = ''
      afterQuote = false
    } else if (character === '\r' || character === '\n') {
      if (character === '\r' && source[index + 1] === '\n') index++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      afterQuote = false
    } else {
      field += character
    }
  }

  if (inQuotes) throw new Error('A quoted CSV value is not closed.')
  if (field.length || row.length || afterQuote) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const result = computed(() => {
  const source = input.value.replace(/^\uFEFF/, '')
  if (!source.trim()) return { value: '', rows: 0, error: '' }

  try {
    const records = parseCsv(source)
    while (records.length && records[records.length - 1].every((cell) => cell === '')) records.pop()
    if (!records.length) return { value: '', rows: 0, error: 'Add a header row to the CSV input.' }

    const headers = records[0].map((header) => header.trim())
    if (headers.some((header) => !header))
      return { value: '', rows: 0, error: 'Column names cannot be empty.' }
    if (new Set(headers).size !== headers.length)
      return { value: '', rows: 0, error: 'Column names must be unique.' }

    const data = records.slice(1)
    const mismatch = data.findIndex((record) => record.length !== headers.length)
    if (mismatch !== -1) {
      return {
        value: '',
        rows: 0,
        error: `Row ${mismatch + 2} has ${data[mismatch].length} columns; expected ${headers.length}.`,
      }
    }

    return {
      value: JSON.stringify(
        data.map((record) => Object.fromEntries(headers.map((key, index) => [key, record[index]]))),
        null,
        2
      ),
      rows: data.length,
      error: '',
    }
  } catch (cause) {
    return {
      value: '',
      rows: 0,
      error: cause instanceof Error ? cause.message : 'Could not parse the CSV input.',
    }
  }
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value.value)
    toast('JSON copied')
  } catch {
    toast('Could not copy JSON', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
