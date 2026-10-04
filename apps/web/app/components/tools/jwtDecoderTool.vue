<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid gap-2">
        <Label for="jwt-input">JSON Web Token</Label>
        <Textarea
          id="jwt-input"
          v-model="token"
          rows="5"
          class="border-border bg-background min-h-32 w-full rounded-md border p-3 font-mono text-sm"
          placeholder="Paste a JWT (three dot-separated parts)"
          spellcheck="false"
        />
        <p v-if="error" class="text-destructive text-sm" role="alert">{{ error }}</p>
        <p v-else-if="expired" class="text-destructive text-sm" role="status">
          This token has expired.
        </p>
        <p v-else-if="decoded" class="text-muted-foreground text-sm" role="status">
          Token decoded{{ expiresAt ? ` · Expires ${expiresAt}` : '' }}.
          <span v-if="algorithm === 'none'"> This token does not use a signature algorithm.</span>
        </p>
        <p v-else class="text-muted-foreground text-sm"
          >Decoding happens locally in your browser.</p
        >
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <section class="grid content-start gap-2">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-medium">Header</h2>
            <Button size="sm" variant="outline" :disabled="!header" @click="copy(header)"
              >Copy</Button
            >
          </div>
          <pre
            class="border-border bg-muted/30 min-h-36 overflow-auto rounded-lg border p-4 text-sm"
          ><code>{{ header || 'Decoded header will appear here.' }}</code></pre>
        </section>
        <section class="grid content-start gap-2">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-medium">Payload</h2>
            <Button size="sm" variant="outline" :disabled="!payload" @click="copy(payload)"
              >Copy</Button
            >
          </div>
          <pre
            class="border-border bg-muted/30 min-h-36 overflow-auto rounded-lg border p-4 text-sm"
          ><code>{{ payload || 'Decoded payload will appear here.' }}</code></pre>
        </section>
      </div>

      <section class="grid gap-2">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-medium">Signature</h2>
          <Button size="sm" variant="outline" :disabled="!signature" @click="copy(signature)"
            >Copy</Button
          >
        </div>
        <code
          class="border-border bg-muted/30 block min-h-12 break-all rounded-lg border p-4 text-sm"
          >{{ signature || 'Encoded signature will appear here.' }}</code
        >
      </section>

      <section class="grid gap-3">
        <div class="grid gap-2">
          <Label for="jwt-key">Secret or public key (optional)</Label>
          <Textarea
            id="jwt-key"
            v-model="key"
            rows="4"
            class="border-border bg-background min-h-24 w-full rounded-md border p-3 font-mono text-sm"
            :placeholder="
              algorithm === 'HS256'
                ? 'Shared secret for HS256'
                : 'PEM public key for RS256 or ES256 (SPKI format)'
            "
            spellcheck="false"
            autocomplete="off"
          />
          <p v-if="verificationError" class="text-destructive text-sm" role="alert">{{
            verificationError
          }}</p>
          <p
            v-else-if="signatureValid !== null"
            class="text-sm"
            :class="signatureValid ? 'text-green-700 dark:text-green-400' : 'text-destructive'"
            role="status"
          >
            {{ signatureValid ? 'Signature is valid.' : 'Signature is invalid.' }}
          </p>
          <p v-else class="text-muted-foreground text-xs">
            Provide the matching key to check the signature. RS256 and ES256 require a PEM public
            key in SPKI format.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            class="h-11 px-5"
            :disabled="!decoded || !key.trim() || verifying || algorithm === 'none'"
            @click="verify"
          >
            {{ verifying ? 'Checking…' : 'Check signature' }}
          </Button>
          <Button variant="outline" class="h-11 px-5" @click="clearAll">Clear</Button>
        </div>
      </section>
    </div>
    <ToolExplanation
      title="Inspect a JSON Web Token"
      intro="A JWT contains a header, a payload, and a signature, encoded as three Base64url segments separated by dots."
      detail="Decoding reveals the token contents but does not prove they are trustworthy. Signature verification checks the signed header and payload with the supplied key. Expiration is reported from the payload's exp claim."
      use-case="Inspect claims and check a token signature while debugging an authentication flow. Treat decoded claims as untrusted until you verify the signature."
    />
  </ToolLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import ToolLayout from '@/components/tool/toolLayout.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ToolExplanation from '~/components/tool/toolExplanation.vue'

interface JwtHeader {
  alg?: string
  [claim: string]: unknown
}

const token = ref('')
const key = ref('')
const verificationError = ref('')
const signatureValid = ref<boolean | null>(null)
const verifying = ref(false)

function decodeSegment(segment: string): string {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment))
    throw new Error('A JWT segment contains invalid Base64url characters.')
  const base64 =
    segment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (segment.length % 4)) % 4)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

const decoded = computed(() => {
  if (!token.value.trim()) return null
  try {
    const parts = token.value.trim().split('.')
    if (parts.length !== 3 || parts.some((part) => !part))
      throw new Error('A JWT must contain three non-empty dot-separated parts.')
    const parsedHeader: unknown = JSON.parse(decodeSegment(parts[0]!))
    const parsedPayload: unknown = JSON.parse(decodeSegment(parts[1]!))
    if (!parsedHeader || typeof parsedHeader !== 'object' || Array.isArray(parsedHeader))
      throw new Error('The JWT header must be a JSON object.')
    if (!parsedPayload || typeof parsedPayload !== 'object' || Array.isArray(parsedPayload))
      throw new Error('The JWT payload must be a JSON object.')
    return {
      parts,
      header: JSON.stringify(parsedHeader, null, 2),
      payload: JSON.stringify(parsedPayload, null, 2),
      headerData: parsedHeader as JwtHeader,
      payloadData: parsedPayload as Record<string, unknown>,
    }
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : 'Could not decode this JWT.' }
  }
})

const error = computed(() => (decoded.value && 'error' in decoded.value ? decoded.value.error : ''))
const header = computed(() =>
  decoded.value && 'header' in decoded.value ? decoded.value.header : ''
)
const payload = computed(() =>
  decoded.value && 'payload' in decoded.value ? decoded.value.payload : ''
)
const signature = computed(() =>
  decoded.value && 'parts' in decoded.value ? decoded.value.parts[2]! : ''
)
const algorithm = computed(() =>
  decoded.value && 'headerData' in decoded.value ? (decoded.value.headerData.alg ?? '') : ''
)
const expiresAt = computed(() => {
  const exp =
    decoded.value && 'payloadData' in decoded.value ? decoded.value.payloadData.exp : undefined
  return typeof exp === 'number' && Number.isFinite(exp)
    ? new Date(exp * 1000).toLocaleString()
    : ''
})
const expired = computed(() => {
  const exp =
    decoded.value && 'payloadData' in decoded.value ? decoded.value.payloadData.exp : undefined
  return typeof exp === 'number' && Number.isFinite(exp) && exp <= Date.now() / 1000
})

watch([token, key], () => {
  signatureValid.value = null
  verificationError.value = ''
})

function pemBytes(pem: string): Uint8Array {
  const body = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '')
  if (!body || !/^[A-Za-z0-9+/]+={0,2}$/.test(body))
    throw new Error('Enter a valid PEM public key in SPKI format.')
  const binary = atob(body)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function verify() {
  if (!decoded.value || !('parts' in decoded.value)) return
  verifying.value = true
  signatureValid.value = null
  verificationError.value = ''
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = decoded.value.parts
    const signedData = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    const signatureBytes = Uint8Array.from(
      atob(
        encodedSignature!.replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (encodedSignature!.length % 4)) % 4)
      ),
      (character) => character.charCodeAt(0)
    )
    const alg = algorithm.value
    let cryptoKey: CryptoKey
    let verifyAlgorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams
    if (alg === 'HS256') {
      cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(key.value),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      verifyAlgorithm = 'HMAC'
    } else if (alg === 'RS256' || alg === 'ES256') {
      cryptoKey = await crypto.subtle.importKey(
        'spki',
        pemBytes(key.value),
        alg === 'RS256'
          ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
          : { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify']
      )
      verifyAlgorithm = alg === 'RS256' ? 'RSASSA-PKCS1-v1_5' : { name: 'ECDSA', hash: 'SHA-256' }
    } else {
      throw new Error(`Signature verification does not support the ${alg || 'missing'} algorithm.`)
    }
    signatureValid.value = await crypto.subtle.verify(
      verifyAlgorithm,
      cryptoKey,
      signatureBytes,
      signedData
    )
  } catch (cause) {
    verificationError.value =
      cause instanceof Error ? cause.message : 'Could not verify this signature.'
  } finally {
    verifying.value = false
  }
}

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast('Copied')
  } catch {
    toast('Could not copy', { description: 'Clipboard access is unavailable in this browser.' })
  }
}

function clearAll() {
  token.value = ''
  key.value = ''
  signatureValid.value = null
  verificationError.value = ''
}
</script>
