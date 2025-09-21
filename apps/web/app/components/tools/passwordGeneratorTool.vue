<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

type Opts = {
  length: number
  lower: boolean
  upper: boolean
  digits: boolean
  symbols: boolean
  noAmbiguous: boolean
  requireEach: boolean
}

const opts = reactive<Opts>({
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: false,
  noAmbiguous: true,
  requireEach: true,
})

const password = ref('')

const pools = computed(() => {
  const ambiguous = new Set([
    '0',
    'O',
    'o',
    'l',
    '1',
    'I',
    '|',
    '`',
    "'",
    '"',
    '~',
    ',',
    ';',
    '.',
    ':',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '/',
    '\\',
    '<',
    '>',
  ])
  const base = {
    lower: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    digits: '0123456789'.split(''),
    symbols: '!@#$%^&*+-_=?:'.split(''),
  }
  const filter = (arr: string[]) => (opts.noAmbiguous ? arr.filter((c) => !ambiguous.has(c)) : arr)
  return {
    lower: filter(base.lower),
    upper: filter(base.upper),
    digits: filter(base.digits),
    symbols: filter(base.symbols),
  }
})

const activePools = computed<string[][]>(() => {
  const res: string[][] = []
  if (opts.lower) res.push(pools.value.lower)
  if (opts.upper) res.push(pools.value.upper)
  if (opts.digits) res.push(pools.value.digits)
  if (opts.symbols) res.push(pools.value.symbols)
  return res
})

const poolSize = computed(() => activePools.value.reduce((n, p) => n + p.length, 0))

const entropyBits = computed(() => {
  const L = Math.max(0, opts.length | 0)
  const S = Math.max(1, poolSize.value | 0)
  return +(L * Math.log2(S)).toFixed(2)
})
const strength = computed(() => {
  const e = entropyBits.value
  if (e >= 100) return { label: 'excellent', percent: 100 }
  if (e >= 80) return { label: 'very strong', percent: 85 }
  if (e >= 60) return { label: 'strong', percent: 70 }
  if (e >= 40) return { label: 'medium', percent: 50 }
  return { label: 'weak', percent: 25 }
})

function randIndices(count: number, maxExclusive: number): Uint32Array {
  const out = new Uint32Array(count)
  crypto.getRandomValues(out)
  for (let i = 0; i < count; i++) out[i] = out[i] % maxExclusive
  return out
}

function generate(): void {
  const length = Math.min(128, Math.max(4, opts.length | 0))
  const poolsArr = activePools.value
  const totalPool = poolsArr.flat()
  if (totalPool.length === 0) {
    password.value = ''
    return
  }

  const mustCoverSets = opts.requireEach && poolsArr.length > 1
  const chars: string[] = []

  if (mustCoverSets) {
    for (const p of poolsArr) {
      const idx = randIndices(1, p.length)[0]
      chars.push(p[idx])
    }
  }

  const remaining = Math.max(0, length - chars.length)
  if (remaining > 0) {
    const rnd = randIndices(remaining, totalPool.length)
    for (let i = 0; i < rnd.length; i++) chars.push(totalPool[rnd[i]])
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randIndices(1, i + 1)[0]
    const t = chars[i]
    chars[i] = chars[j]
    chars[j] = t
  }

  password.value = chars.join('')
}

async function copyPw(): Promise<void> {
  if (!password.value) return
  try {
    await navigator.clipboard.writeText(password.value)
  } catch {}
  toast('Copied password')
}

watch(opts, generate, { deep: true })
onMounted(generate)

function set<K extends keyof Opts>(key: K, val: unknown) {
  opts[key] = Boolean(val) as any
}
</script>

<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-6 md:grid-cols-12">
          <div class="md:col-span-4">
            <div class="grid gap-5">
              <div class="grid gap-2">
                <Label for="length"
                  >Length <span class="text-neutral-400">({{ opts.length }})</span></Label
                >
                <div class="flex items-center gap-3">
                  <input
                    id="length"
                    v-model.number="opts.length"
                    type="range"
                    min="4"
                    max="128"
                    step="1"
                    class="w-full accent-neutral-300"
                  />
                  <Input v-model.number="opts.length" type="number" class="w-20" />
                </div>
              </div>

              <div class="grid gap-2">
                <Label>Character sets</Label>
                <div class="grid gap-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Lowercase a–z</span>
                    <Switch
                      :model-value="opts.lower"
                      @update:model-value="(v) => set('lower', v)"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Uppercase A–Z</span>
                    <Switch
                      :model-value="opts.upper"
                      @update:model-value="(v) => set('upper', v)"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Digits 0–9</span>
                    <Switch
                      :model-value="opts.digits"
                      @update:model-value="(v) => set('digits', v)"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Symbols !@#$…</span>
                    <Switch
                      :model-value="opts.symbols"
                      @update:model-value="(v) => set('symbols', v)"
                    />
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <Label>Rules</Label>
                <div class="grid gap-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Exclude ambiguous</span>
                    <Switch
                      :model-value="opts.noAmbiguous"
                      @update:model-value="(v) => set('noAmbiguous', v)"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-neutral-300">Require each selected set</span>
                    <Switch
                      :model-value="opts.requireEach"
                      @update:model-value="(v) => set('requireEach', v)"
                    />
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <Label>Strength</Label>
                <div class="h-2 w-full overflow-hidden rounded bg-neutral-800">
                  <div
                    class="h-full"
                    :class="[
                      strength.percent >= 80
                        ? 'bg-green-500'
                        : strength.percent >= 60
                          ? 'bg-emerald-500'
                          : strength.percent >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500',
                    ]"
                    :style="{ width: strength.percent + '%' }"
                  />
                </div>
                <p class="text-xs text-neutral-400">
                  ~{{ entropyBits }} bits • {{ strength.label }}
                </p>
              </div>

              <div class="flex gap-2 pt-2">
                <Button :disabled="poolSize === 0" @click="generate">Generate</Button>
                <Button variant="outline" :disabled="!password" @click="copyPw">Copy</Button>
              </div>
            </div>
          </div>

          <div class="md:col-span-8">
            <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
              <div class="grid gap-4">
                <div class="grid gap-2">
                  <Label for="pw">Password</Label>
                  <Input id="pw" v-model="password" readonly class="font-mono" />
                  <p class="text-xs text-neutral-500">
                    Generated client-side using Web Crypto. Snappo never sends this value anywhere.
                  </p>
                </div>

                <Separator class="bg-neutral-800" />

                <div class="grid gap-2">
                  <Label>Character pool</Label>
                  <p class="text-xs text-neutral-400">Active characters: {{ poolSize }}</p>
                  <div class="space-y-1 text-xs text-neutral-400">
                    <div v-if="opts.lower">a–z: {{ pools.lower.join('') }}</div>
                    <div v-if="opts.upper">A–Z: {{ pools.upper.join('') }}</div>
                    <div v-if="opts.digits">0–9: {{ pools.digits.join('') }}</div>
                    <div v-if="opts.symbols">Symbols: {{ pools.symbols.join('') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
