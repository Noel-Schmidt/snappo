<template>
  <tool-layout>
    <div class="mx-auto max-w-7xl space-y-8">
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="space-y-6">
          <header class="space-y-2">
            <h2 class="text-base font-semibold">Create a password hash</h2>
            <p class="text-muted-foreground mt-1 text-sm leading-6">
              Choose a password and hashing cost. Bcrypt produces a one-way hash for storage.
            </p>
          </header>

          <div class="grid gap-6">
            <div class="grid gap-2">
              <Label for="bcrypt-password">Password</Label>
              <Input
                id="bcrypt-password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="Enter a password"
                :disabled="busy"
                class="h-11"
                @keydown.enter.prevent="generate"
              />
            </div>

            <div class="grid gap-3">
              <div class="flex items-start justify-between gap-4">
                <div class="grid gap-1">
                  <Label for="bcrypt-rounds">Cost factor</Label>
                  <p class="text-muted-foreground text-sm leading-5">
                    Higher values take longer to hash and verify.
                  </p>
                </div>
                <div class="text-right">
                  <output
                    for="bcrypt-rounds"
                    class="text-foreground font-mono text-2xl font-semibold tabular-nums"
                  >
                    {{ rounds }}
                  </output>
                  <div class="text-muted-foreground text-xs">rounds</div>
                </div>
              </div>
              <Slider
                id="bcrypt-rounds"
                v-model.number="rounds"
                min="4"
                max="20"
                aria-label="Bcrypt cost factor"
                :disabled="busy"
              />
              <div class="text-muted-foreground flex justify-between text-xs">
                <span>4 - Faster</span>
                <span>20 - Slower</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                :disabled="busy || !password"
                :aria-busy="busy"
                class="h-11 px-5"
                @click="generate"
              >
                <Loader2 v-if="busy" class="mr-2 h-4 w-4 animate-spin" />
                {{ busy ? 'Generating hash...' : 'Generate hash' }}
              </Button>
              <Button
                variant="outline"
                :disabled="busy || !hash"
                class="h-11 px-5"
                @click="copy(hash)"
              >
                Copy hash
              </Button>
              <Button
                variant="ghost"
                :disabled="busy || (!password && !hash)"
                class="h-11 px-5"
                @click="resetLeft"
              >
                Clear
              </Button>
            </div>

            <div class="grid gap-2">
              <div class="flex items-center justify-between gap-3">
                <Label for="bcrypt-hash">Generated hash</Label>
                <span v-if="hash" class="text-muted-foreground text-xs">Cost {{ rounds }}</span>
              </div>
              <Textarea
                id="bcrypt-hash"
                v-model="hash"
                rows="3"
                placeholder="Your bcrypt hash will appear here"
                class="min-h-24 font-mono text-sm leading-6"
                readonly
              />
              <p class="text-muted-foreground text-xs leading-5">
                Passwords are processed in your browser and are not sent to a server.
              </p>
            </div>
          </div>
        </section>

        <section
          class="border-border space-y-6 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <header class="space-y-2">
            <h2 class="text-base font-semibold">Verify a password</h2>
            <p class="text-muted-foreground mt-1 text-sm leading-6">
              Compare a password with a bcrypt hash. The hash cannot be decrypted.
            </p>
          </header>

          <div class="grid content-start gap-6">
            <div class="grid gap-2">
              <Label for="bcrypt-existing-hash">Existing hash</Label>
              <Textarea
                id="bcrypt-existing-hash"
                v-model="hashIn"
                rows="3"
                placeholder="$2b$12$..."
                class="min-h-24 font-mono text-sm leading-6"
                :disabled="busy"
                @input="verdict = 'idle'"
              />
            </div>

            <div class="grid gap-2">
              <Label for="bcrypt-check-password">Password to check</Label>
              <Input
                id="bcrypt-check-password"
                v-model="pwCheck"
                type="password"
                autocomplete="current-password"
                placeholder="Enter the password to verify"
                :disabled="busy"
                class="h-11"
                @keydown.enter.prevent="verify"
                @input="verdict = 'idle'"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <Button :disabled="busy || !hashIn || !pwCheck" class="h-11 px-5" @click="verify">
                Verify password
              </Button>
              <Button
                variant="outline"
                :disabled="busy || !hashIn"
                class="h-11 px-5"
                @click="copy(hashIn)"
              >
                Copy hash
              </Button>
              <Button
                variant="ghost"
                :disabled="busy || (!hashIn && !pwCheck && verdict === 'idle')"
                class="h-11 px-5"
                @click="resetRight"
              >
                Clear
              </Button>
            </div>

            <div
              v-if="verdict !== 'idle'"
              class="rounded-lg border px-4 py-3"
              :class="
                verdict === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-destructive/30 bg-destructive/5'
              "
              role="status"
              aria-live="polite"
            >
              <p class="text-sm font-medium">
                {{ verdict === 'ok' ? 'Password matches' : 'Password does not match' }}
              </p>
              <p class="text-muted-foreground mt-1 text-sm leading-5">
                {{
                  verdict === 'ok'
                    ? 'This password matches the supplied bcrypt hash.'
                    : 'Check the password and hash, then try again.'
                }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <tool-explanation
        title="What is bcrypt?"
        intro="Bcrypt is a password-hashing function designed to make password guessing computationally expensive. It combines a password with a salt and applies a configurable cost factor before producing a hash."
        detail="The cost factor controls how much work bcrypt performs when it creates or verifies a hash. Bcrypt is one-way, so a hash cannot be decrypted. Verification tests a supplied password against the hash instead."
        use-case="Use this tool to create a bcrypt hash for testing or to check whether a password matches an existing hash. In an application, store the hash and verify future passwords against it rather than storing the original password."
      />
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import bcrypt from 'bcryptjs'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import ToolLayout from '~/components/tool/toolLayout.vue'

const password = ref('')
const rounds = ref(12)
const hash = ref('')
const busy = ref(false)
const hashIn = ref('')
const pwCheck = ref('')
const verdict = ref<'idle' | 'ok' | 'fail'>('idle')

async function generate() {
  if (!password.value || busy.value) return
  busy.value = true
  try {
    hash.value = await bcrypt.hash(password.value, rounds.value)
    verdict.value = 'idle'
  } finally {
    busy.value = false
  }
}

async function copy(value: string) {
  if (!value) return
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    // Clipboard access may be unavailable outside a secure browser context.
  }
}

function resetLeft() {
  password.value = ''
  rounds.value = 12
  hash.value = ''
}

function verify() {
  if (!hashIn.value || !pwCheck.value) return
  try {
    verdict.value = bcrypt.compareSync(pwCheck.value, hashIn.value) ? 'ok' : 'fail'
  } catch {
    verdict.value = 'fail'
  }
}

function resetRight() {
  hashIn.value = ''
  pwCheck.value = ''
  verdict.value = 'idle'
}
</script>
