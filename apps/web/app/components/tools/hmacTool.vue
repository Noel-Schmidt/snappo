<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-6">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="grid gap-2">
            <Label for="hmac-algorithm">Algorithm</Label>
            <Select v-model="algorithm">
              <SelectTrigger id="hmac-algorithm" class="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SHA-1">SHA-1</SelectItem>
                <SelectItem value="SHA-256">SHA-256</SelectItem>
                <SelectItem value="SHA-512">SHA-512</SelectItem>
                <SelectItem value="MD5">MD5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label for="hmac-encoding">Output encoding</Label>
            <Select v-model="encoding">
              <SelectTrigger id="hmac-encoding" class="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hex">Hexadecimal</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label for="hmac-mode">Mode</Label>
            <Select v-model="mode">
              <SelectTrigger id="hmac-mode" class="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="generate">Generate</SelectItem>
                <SelectItem value="verify">Verify</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="grid content-start gap-5">
            <div class="grid gap-2">
              <Label for="hmac-message">Message</Label>
              <Textarea
                id="hmac-message"
                v-model="message"
                rows="7"
                class="border-border bg-background min-h-40 w-full rounded-md border p-3 font-mono text-sm"
                placeholder="Text to authenticate"
                spellcheck="false"
              />
            </div>
            <div class="grid gap-2">
              <Label for="hmac-key">Secret key</Label>
              <Input
                id="hmac-key"
                v-model="secret"
                type="password"
                autocomplete="off"
                class="h-11 font-mono"
                placeholder="Enter the shared secret"
              />
              <p v-if="!secret" class="text-muted-foreground text-xs">
                Enter a secret key before generating or verifying an HMAC.
              </p>
            </div>
            <div v-if="mode === 'verify'" class="grid gap-2">
              <Label for="expected-hmac">Expected HMAC</Label>
              <Input
                id="expected-hmac"
                v-model="expected"
                class="h-11 font-mono"
                :placeholder="
                  encoding === 'hex'
                    ? 'Paste the expected hex value'
                    : 'Paste the expected Base64 value'
                "
                spellcheck="false"
              />
              <p v-if="!expected.trim()" class="text-muted-foreground text-xs">
                Paste the expected value using the selected encoding.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                class="h-11 px-5"
                :disabled="loading || !secret || (mode === 'verify' && !expected.trim())"
                @click="runHmac"
              >
                {{ loading ? 'Working…' : mode === 'generate' ? 'Generate HMAC' : 'Verify HMAC' }}
              </Button>
              <Button variant="outline" class="h-11 px-5" :disabled="loading" @click="clearAll"
                >Clear</Button
              >
            </div>
            <p class="text-muted-foreground text-xs"
              >Message and key are processed locally in your browser.</p
            >
          </div>

          <div class="grid content-start gap-3">
            <div class="flex items-center justify-between gap-3">
              <h3 id="hmac-result-label" class="text-sm font-medium">
                {{ mode === 'generate' ? 'Generated HMAC' : 'Verification' }}
              </h3>
              <Button
                v-if="mode === 'generate'"
                size="sm"
                variant="outline"
                :disabled="!output"
                @click="copyOutput"
              >
                Copy
              </Button>
            </div>
            <div
              class="border-border bg-muted/30 min-h-36 rounded-lg border p-4"
              aria-labelledby="hmac-result-label"
              aria-live="polite"
            >
              <p v-if="error" class="text-destructive text-sm" role="alert">{{ error }}</p>
              <template v-else-if="output">
                <code class="text-foreground block break-all font-mono text-sm">
                  {{ output }}
                </code>
              </template>
              <p
                v-else-if="matches !== null"
                class="text-sm font-medium"
                :class="matches ? 'text-green-700 dark:text-green-400' : 'text-destructive'"
              >
                {{ matches ? 'HMAC matches.' : 'HMAC does not match.' }}
              </p>
              <p v-else class="text-muted-foreground text-sm">
                {{
                  mode === 'generate'
                    ? 'Generate an HMAC to see the result.'
                    : 'Enter an expected HMAC to verify it.'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolExplanation
      title="Generate and verify HMAC values"
      intro="An HMAC combines a message with a shared secret key to produce a value that can be checked by another system using the same key."
      detail="Choose the algorithm and output encoding expected by the integration. Verification compares the expected value with a newly calculated HMAC. MD5 and SHA-1 are included for compatibility with existing systems."
      use-case="Check webhook signatures, compare API examples, or verify messages in an integration test."
    />
  </ToolLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import ToolExplanation from '~/components/tool/toolExplanation.vue'

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512' | 'MD5'
type Encoding = 'hex' | 'base64'
type Mode = 'generate' | 'verify'

const algorithm = ref<Algorithm>('SHA-256')
const encoding = ref<Encoding>('hex')
const mode = ref<Mode>('generate')
const message = ref('')
const secret = ref('')
const expected = ref('')
const output = ref('')
const error = ref('')
const matches = ref<boolean | null>(null)
const loading = ref(false)

watch([algorithm, encoding, mode, message, secret, expected], () => {
  output.value = ''
  error.value = ''
  matches.value = null
})

const shifts = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
  10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
]
const constants = Array.from(
  { length: 64 },
  (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
)

function md5(input: Uint8Array): Uint8Array {
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64
  const padded = new Uint8Array(paddedLength)
  padded.set(input)
  padded[input.length] = 0x80
  const bitLength = BigInt(input.length) * 8n
  for (let index = 0; index < 8; index++) {
    padded[paddedLength - 8 + index] = Number((bitLength >> BigInt(index * 8)) & 0xffn)
  }

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(16)
    for (let index = 0; index < words.length; index++) {
      const start = offset + index * 4
      words[index] =
        padded[start] |
        (padded[start + 1] << 8) |
        (padded[start + 2] << 16) |
        (padded[start + 3] << 24)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let index = 0; index < 64; index++) {
      let value: number
      let wordIndex: number
      if (index < 16) {
        value = (b & c) | (~b & d)
        wordIndex = index
      } else if (index < 32) {
        value = (d & b) | (~d & c)
        wordIndex = (5 * index + 1) % 16
      } else if (index < 48) {
        value = b ^ c ^ d
        wordIndex = (3 * index + 5) % 16
      } else {
        value = c ^ (b | ~d)
        wordIndex = (7 * index) % 16
      }

      const sum = (a + value + constants[index] + words[wordIndex]) >>> 0
      const shift = shifts[index]
      const rotated = ((sum << shift) | (sum >>> (32 - shift))) >>> 0
      const previousD = d
      d = c
      c = b
      b = (b + rotated) >>> 0
      a = previousD
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  const digest = new Uint8Array(16)
  ;[a0, b0, c0, d0].forEach((word, wordIndex) => {
    for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
      digest[wordIndex * 4 + byteIndex] = (word >>> (byteIndex * 8)) & 0xff
    }
  })
  return digest
}

async function digestBytes(data: Uint8Array): Promise<Uint8Array> {
  if (algorithm.value === 'MD5') return md5(data)
  const digest = await crypto.subtle.digest(algorithm.value, data)
  return new Uint8Array(digest)
}

async function calculateHmac(): Promise<Uint8Array> {
  const blockSize = 64
  let key = new TextEncoder().encode(secret.value)
  if (key.length > blockSize) key = await digestBytes(key)

  const innerPad = new Uint8Array(blockSize)
  const outerPad = new Uint8Array(blockSize)
  for (let index = 0; index < blockSize; index++) {
    const keyByte = key[index] ?? 0
    innerPad[index] = keyByte ^ 0x36
    outerPad[index] = keyByte ^ 0x5c
  }

  const messageBytes = new TextEncoder().encode(message.value)
  const inner = new Uint8Array(innerPad.length + messageBytes.length)
  inner.set(innerPad)
  inner.set(messageBytes, innerPad.length)
  const innerDigest = await digestBytes(inner)

  const outer = new Uint8Array(outerPad.length + innerDigest.length)
  outer.set(outerPad)
  outer.set(innerDigest, outerPad.length)
  return digestBytes(outer)
}

function formatDigest(digest: Uint8Array): string {
  if (encoding.value === 'hex') {
    return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return btoa(String.fromCharCode(...digest))
}

function parseExpected(value: string, byteLength: number): Uint8Array {
  const trimmed = value.trim()
  if (encoding.value === 'hex') {
    if (!new RegExp(`^[0-9a-fA-F]{${byteLength * 2}}$`).test(trimmed)) {
      throw new Error(`Expected a ${byteLength * 2}-character hexadecimal HMAC.`)
    }
    return Uint8Array.from({ length: byteLength }, (_, index) =>
      Number.parseInt(trimmed.slice(index * 2, index * 2 + 2), 16)
    )
  }

  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(trimmed)) {
    throw new Error('Expected a valid Base64 HMAC.')
  }
  let decoded: string
  try {
    decoded = atob(trimmed)
  } catch {
    throw new Error('Expected a valid Base64 HMAC.')
  }
  if (decoded.length !== byteLength) throw new Error(`Expected a ${byteLength}-byte HMAC.`)
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index++) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return difference === 0
}

async function runHmac() {
  if (!secret.value) {
    error.value = 'Enter a secret key.'
    return
  }
  if (mode.value === 'verify' && !expected.value.trim()) {
    error.value = 'Enter the expected HMAC to verify.'
    return
  }

  loading.value = true
  output.value = ''
  error.value = ''
  matches.value = null

  try {
    const digest = await calculateHmac()
    if (mode.value === 'generate') {
      output.value = formatDigest(digest)
    } else {
      const expectedBytes = parseExpected(expected.value, digest.length)
      matches.value = constantTimeEqual(digest, expectedBytes)
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not calculate the HMAC.'
  } finally {
    loading.value = false
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value)
    toast('HMAC copied')
  } catch {
    toast('Could not copy HMAC', {
      description: 'Clipboard access is unavailable in this browser.',
    })
  }
}

function clearAll() {
  message.value = ''
  secret.value = ''
  expected.value = ''
  output.value = ''
  error.value = ''
  matches.value = null
}
</script>
