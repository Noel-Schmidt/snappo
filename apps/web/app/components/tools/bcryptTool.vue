<template>
  <tool-layout>
    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-5">
          <div class="grid gap-2">
            <Label for="pw">Password</Label>
            <Input
              id="pw"
              v-model="password"
              type="password"
              placeholder="Enter password"
              :disabled="busy"
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="rounds">Salt rounds</Label>
              <span class="text-xs text-neutral-400">{{ rounds }}</span>
            </div>
            <input
              id="rounds"
              v-model.number="rounds"
              type="range"
              min="4"
              max="20"
              class="w-full accent-neutral-300"
              :disabled="busy"
            />
            <div class="mt-1">
              <div class="h-2 w-full rounded-full bg-neutral-800">
                <div
                  class="h-2 rounded-full"
                  :class="strengthBar.class"
                  :style="{ width: strengthBar.width }"
                />
              </div>
              <div class="mt-1 flex justify-between text-xs text-neutral-400">
                <span>low</span><span>recommended</span><span>high</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Button
              :disabled="busy || !password"
              :aria-busy="busy ? 'true' : 'false'"
              @click="generate"
            >
              <template v-if="busy">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </template>
              <template v-else> Generate hash </template>
            </Button>
            <Button variant="outline" :disabled="busy || !hash" @click="copy">Copy</Button>
            <Button variant="outline" :disabled="busy || (!password && !hash)" @click="resetLeft"
              >Clear</Button
            >
          </div>

          <div class="grid gap-2">
            <Label for="hash">Hash</Label>
            <textarea
              id="hash"
              v-model="hash"
              rows="3"
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
              readonly
            />
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-5">
          <div class="grid gap-2">
            <Label for="hashIn">Existing hash</Label>
            <textarea
              id="hashIn"
              v-model="hashIn"
              rows="3"
              placeholder="$2b$12$..."
              class="w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200 outline-none focus:ring-2 focus:ring-neutral-700"
              :disabled="busy"
            />
          </div>

          <div class="grid gap-2">
            <Label for="pwCheck">Password to verify</Label>
            <Input
              id="pwCheck"
              v-model="pwCheck"
              type="password"
              placeholder="Enter password"
              :disabled="busy"
            />
          </div>

          <div class="flex items-center gap-3">
            <Button :disabled="busy || !hashIn || !pwCheck" @click="verify">Verify</Button>
            <span v-if="verdict === 'ok'" class="text-sm text-emerald-400">Match</span>
            <span v-else-if="verdict === 'fail'" class="text-sm text-rose-400">No match</span>
          </div>

          <div class="flex gap-3">
            <Button variant="outline" :disabled="busy || !hashIn" @click="copyHashIn"
              >Copy hash</Button
            >
            <Button
              variant="outline"
              :disabled="busy || (!hashIn && !pwCheck && verdict === 'idle')"
              @click="resetRight"
              >Clear</Button
            >
          </div>
        </div>
      </div>
    </div>

    <p class="mt-4 text-xs text-neutral-400">
      Note: bcrypt is one-way. Decrypting is not possible. Use the verify box to check a password
      against a hash.
    </p>
  </tool-layout>
</template>

<script setup lang="ts">
import bcrypt from 'bcryptjs'
import { Loader2 } from 'lucide-vue-next'
import { ref, computed } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ToolLayout from '~/components/tool/toolLayout.vue'

const password = ref('')
const rounds = ref(12)
const hash = ref('')
const busy = ref(false)

const hashIn = ref('')
const pwCheck = ref('')
const verdict = ref<'idle' | 'ok' | 'fail'>('idle')

const strengthBar = computed(() => {
  const min = 4,
    max = 20
  const pct = Math.round(((rounds.value - min) / (max - min)) * 100)
  let cls = 'bg-emerald-500'
  if (rounds.value <= 8) cls = 'bg-rose-500'
  else if (rounds.value <= 12) cls = 'bg-amber-500'
  else if (rounds.value <= 16) cls = 'bg-emerald-500'
  else cls = 'bg-sky-500'
  return { width: `${pct}%`, class: cls }
})

const generate = async () => {
  busy.value = true
  try {
    // async hash for visible loading feedback at high rounds
    hash.value = await bcrypt.hash(password.value, rounds.value)
    verdict.value = 'idle'
  } finally {
    busy.value = false
  }
}

const copy = async () => {
  if (!hash.value) return
  try {
    await navigator.clipboard.writeText(hash.value)
  } catch {}
}

const resetLeft = () => {
  password.value = ''
  rounds.value = 12
  hash.value = ''
}

const verify = () => {
  if (!hashIn.value || !pwCheck.value) return
  verdict.value = bcrypt.compareSync(pwCheck.value, hashIn.value) ? 'ok' : 'fail'
}

const copyHashIn = async () => {
  if (!hashIn.value) return
  try {
    await navigator.clipboard.writeText(hashIn.value)
  } catch {}
}

const resetRight = () => {
  hashIn.value = ''
  pwCheck.value = ''
  verdict.value = 'idle'
}
</script>
