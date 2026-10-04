<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
    toast('Password copied')
  } catch {
    toast('Could not copy password', { description: 'Check clipboard permissions and try again.' })
  }
}

watch(opts, generate, { deep: true })
onMounted(generate)

function set<K extends keyof Opts>(key: K, val: unknown) {
  opts[key] = Boolean(val) as any
}
</script>

<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div class="grid content-start gap-6">
          <div class="grid gap-2">
            <Label for="pw">Your password</Label>
            <div class="flex gap-2">
              <Input
                id="pw"
                :model-value="password"
                readonly
                spellcheck="false"
                autocomplete="off"
                class="h-12 min-w-0 font-mono text-base tracking-wide sm:text-lg"
                aria-live="polite"
              />
              <Button variant="outline" :disabled="!password" @click="copyPw" class="h-12 px-4"
                >Copy</Button
              >
            </div>
            <p class="text-muted-foreground text-sm"
              >Created in your browser with Web Crypto. Your password is never sent anywhere.</p
            >
          </div>
          <div class="grid gap-3">
            <div class="flex items-center justify-between gap-4"
              ><Label for="length">Password length</Label
              ><span class="text-foreground font-mono text-sm tabular-nums">{{
                opts.length
              }}</span></div
            >
            <Slider
              v-model.number="opts.length"
              min="4"
              max="128"
              step="1"
              aria-label="Password length"
            />
            <div class="flex items-center justify-between gap-4"
              ><span class="text-muted-foreground text-xs">4</span
              ><Input
                id="length"
                v-model.number="opts.length"
                type="number"
                min="4"
                max="128"
                class="h-9 w-20 text-right tabular-nums"
                aria-label="Password length in characters"
              /><span class="text-muted-foreground text-xs">128</span></div
            >
          </div>
          <div class="grid gap-3">
            <h2 class="text-sm font-semibold">Character types</h2>
            <div class="grid grid-cols-2 gap-2">
              <label
                class="border-border flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3"
                ><span class="text-sm"
                  >Lowercase <span class="text-muted-foreground">a?z</span></span
                ><Switch
                  :model-value="opts.lower"
                  aria-label="Include lowercase letters"
                  @update:model-value="(v) => set('lower', v)"
              /></label>
              <label
                class="border-border flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3"
                ><span class="text-sm"
                  >Uppercase <span class="text-muted-foreground">A?Z</span></span
                ><Switch
                  :model-value="opts.upper"
                  aria-label="Include uppercase letters"
                  @update:model-value="(v) => set('upper', v)"
              /></label>
              <label
                class="border-border flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3"
                ><span class="text-sm">Numbers <span class="text-muted-foreground">0?9</span></span
                ><Switch
                  :model-value="opts.digits"
                  aria-label="Include numbers"
                  @update:model-value="(v) => set('digits', v)"
              /></label>
              <label
                class="border-border flex min-h-12 items-center justify-between gap-2 rounded-lg border px-3"
                ><span class="text-sm">Symbols <span class="text-muted-foreground">!@#$</span></span
                ><Switch
                  :model-value="opts.symbols"
                  aria-label="Include symbols"
                  @update:model-value="(v) => set('symbols', v)"
              /></label>
            </div>
            <p v-if="poolSize === 0" class="text-destructive text-sm" role="alert"
              >Select at least one character type to generate a password.</p
            >
          </div>
          <div class="border-border grid gap-3 border-t pt-5">
            <h2 class="text-sm font-semibold">Options</h2>
            <label class="flex items-center justify-between gap-4"
              ><span class="text-sm">Exclude look-alike characters</span
              ><Switch
                :model-value="opts.noAmbiguous"
                aria-label="Exclude look-alike characters"
                @update:model-value="(v) => set('noAmbiguous', v)"
            /></label>
            <label class="flex items-center justify-between gap-4"
              ><span class="text-sm">Include each selected type</span
              ><Switch
                :model-value="opts.requireEach"
                aria-label="Require each selected character type"
                @update:model-value="(v) => set('requireEach', v)"
            /></label>
          </div>
          <Button :disabled="poolSize === 0" @click="generate" class="h-11 w-full"
            >Generate password</Button
          >
        </div>
        <aside
          class="border-border grid content-start gap-6 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <div class="grid gap-3">
            <div class="flex items-baseline justify-between gap-3"
              ><h2 class="text-sm font-semibold">Estimated strength</h2
              ><span class="text-sm capitalize">{{ strength.label }}</span></div
            >
            <div
              class="bg-muted h-2 w-full overflow-hidden rounded-full"
              role="progressbar"
              :aria-valuenow="strength.percent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="'Estimated password strength: ' + strength.label"
              ><div
                class="h-full rounded-full transition-[width]"
                :class="
                  strength.percent >= 80
                    ? 'bg-primary'
                    : strength.percent >= 50
                      ? 'bg-amber-500'
                      : 'bg-destructive'
                "
                :style="{ width: strength.percent + '%' }"
            /></div>
            <p class="text-muted-foreground text-sm">{{ entropyBits }} bits of estimated entropy</p>
          </div>
          <div class="border-border grid gap-2 border-t pt-5"
            ><h2 class="text-sm font-semibold">Character pool</h2
            ><p class="text-muted-foreground text-sm"
              >{{ poolSize }} possible characters across {{ activePools.length }} selected types.</p
            ></div
          >
          <p class="text-muted-foreground text-xs leading-relaxed"
            >Strength is an estimate based on length and selected characters. A longer, unique
            password is harder to guess.</p
          >
        </aside>
      </div>
    </div>
    <ToolExplanation
      title="About password strength"
      intro="The estimate uses the password length and the size of the selected character pool. It does not account for every attack method or a site's password rules."
      detail="Choose the character types your account accepts, then generate a unique password. Store it in a trusted password manager and avoid reusing it across accounts."
      use-case="Use the length field and character options to meet an account's password requirements."
    />
  </ToolLayout>
</template>
