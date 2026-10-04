<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-5 md:grid-cols-2">
        <div class="grid gap-2">
          <Label for="table-input">Tab-separated rows</Label>
          <Textarea
            id="table-input"
            v-model="input"
            rows="10"
            class="border-border bg-background min-h-56 w-full rounded-md border p-3 font-mono text-sm"
            placeholder="Name&#9;Role&#10;Ada&#9;Engineer"
            spellcheck="false"
          />
          <p class="text-muted-foreground text-xs"
            >Use a tab between columns and a new line between rows. The first row becomes the
            header.</p
          >
        </div>
        <div class="grid content-start gap-2">
          <div class="flex items-center justify-between gap-3">
            <Label for="table-output">Markdown table</Label>
            <Button size="sm" variant="outline" :disabled="!result" @click="copyResult"
              >Copy</Button
            >
          </div>
          <Textarea
            id="table-output"
            :model-value="result"
            rows="10"
            readonly
            class="border-border bg-muted/30 min-h-56 w-full rounded-md border p-3 font-mono text-sm"
            aria-live="polite"
          />
          <p class="text-muted-foreground text-xs"
            >Pipe characters in cells are escaped for Markdown.</p
          >
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Build a Markdown table from rows"
      intro="Markdown tables use pipes to separate columns and a divider row to distinguish the header from table data."
      detail="Paste tab-separated rows from a spreadsheet or text editor. The first row is used as the table header, and shorter rows are padded to match the widest row."
      use-case="Move a small table into a README, issue, pull request, or Markdown note."
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
const result = computed(() => {
  const rows = input.value
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split('\t').map((cell) => cell.trim()))
  if (!rows.length) return ''

  const columns = Math.max(...rows.map((row) => row.length))
  const formatRow = (row: string[]) =>
    `| ${Array.from({ length: columns }, (_, index) => (row[index] ?? '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|')).join(' | ')} |`
  const header = formatRow(rows[0])
  const divider = `| ${Array.from({ length: columns }, () => '---').join(' | ')} |`
  return [header, divider, ...rows.slice(1).map(formatRow)].join('\n')
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value)
    toast('Markdown table copied')
  } catch {
    toast('Could not copy table', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
