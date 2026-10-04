<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div class="grid content-start gap-4">
          <div class="grid gap-2">
            <Label for="number-base">Input base</Label>
            <Select v-model="base">
              <SelectTrigger id="number-base" class="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (base 2)</SelectItem>
                <SelectItem value="8">Octal (base 8)</SelectItem>
                <SelectItem value="10">Decimal (base 10)</SelectItem>
                <SelectItem value="16">Hexadecimal (base 16)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label for="number-input">Whole number</Label>
            <Input
              id="number-input"
              v-model="input"
              class="h-11 font-mono"
              :placeholder="base === '16' ? 'e.g. FF or 0xFF' : `Enter a base ${base} integer`"
              spellcheck="false"
            />
            <p class="text-muted-foreground text-xs"
              >Large integers are supported. A leading minus sign is allowed.</p
            >
          </div>
        </div>
        <div class="grid gap-3" aria-live="polite">
          <p v-if="result.error" class="text-destructive text-sm" role="alert">{{
            result.error
          }}</p>
          <template v-else-if="result.values">
            <div
              v-for="item in result.values"
              :key="item.base"
              class="border-border bg-muted/30 flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
            >
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs">{{ item.label }}</p>
                <code class="text-foreground block break-all font-mono text-sm">{{
                  item.value
                }}</code>
              </div>
              <Button
                size="sm"
                variant="outline"
                :aria-label="`Copy ${item.label.toLowerCase()} value`"
                @click="copyValue(item.value)"
              >
                Copy
              </Button>
            </div>
          </template>
          <p v-else class="text-muted-foreground text-sm"
            >Enter a number to see its value in each base.</p
          >
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Convert whole numbers between bases"
      intro="A number base determines how many symbols represent each digit position. Binary uses two symbols, decimal uses ten, and hexadecimal uses sixteen."
      detail="The converter handles signed whole numbers with arbitrary precision. Prefixes such as 0b, 0o, and 0x are accepted when they match the selected input base."
      use-case="Read bitmasks, inspect hexadecimal values, or convert integers while debugging code."
    />
  </ToolLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import ToolLayout from '@/components/tool/toolLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ToolExplanation from '~/components/tool/toolExplanation.vue'

type Base = '2' | '8' | '10' | '16'
const base = ref<Base>('10')
const input = ref('')
const baseInfo = [
  { radix: 2, label: 'Binary' },
  { radix: 8, label: 'Octal' },
  { radix: 10, label: 'Decimal' },
  { radix: 16, label: 'Hexadecimal' },
]

const result = computed(() => {
  const source = input.value.trim()
  if (!source) return { values: null, error: '' }

  const radix = Number(base.value)
  const prefix =
    radix === 2 ? /^[-+]?0b/i : radix === 8 ? /^[-+]?0o/i : radix === 16 ? /^[-+]?0x/i : null
  const sign = source.startsWith('-') ? -1n : 1n
  const unsigned = source.replace(/^[-+]/, '')
  const digits = prefix ? unsigned.replace(prefix, '') : unsigned
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  if (
    !digits ||
    [...digits.toLowerCase()].some(
      (digit) => alphabet.indexOf(digit) < 0 || alphabet.indexOf(digit) >= radix
    )
  ) {
    return { values: null, error: `Enter a valid base ${radix} whole number.` }
  }

  let value = 0n
  for (const digit of digits.toLowerCase()) {
    value = value * BigInt(radix) + BigInt(alphabet.indexOf(digit))
  }
  value *= sign

  return {
    values: baseInfo.map((item) => ({
      base: item.radix,
      label: item.label,
      value: value.toString(item.radix).toUpperCase(),
    })),
    error: '',
  }
})

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast('Value copied')
  } catch {
    toast('Could not copy value', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}
</script>
