<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type RGB = { r: number; g: number; b: number; a?: number }

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x))
}

function parseHex(s: string): RGB | null {
  const x = s.replace(/^#/, '').trim()
  if (/^[0-9a-fA-F]{3,8}$/.test(x) === false) return null
  if (x.length === 3) {
    const r = parseInt(x[0] + x[0], 16),
      g = parseInt(x[1] + x[1], 16),
      b = parseInt(x[2] + x[2], 16)
    return { r, g, b, a: 1 }
  }
  if (x.length === 4) {
    const r = parseInt(x[0] + x[0], 16),
      g = parseInt(x[1] + x[1], 16),
      b = parseInt(x[2] + x[2], 16),
      a = parseInt(x[3] + x[3], 16) / 255
    return { r, g, b, a }
  }
  if (x.length === 6 || x.length === 8) {
    const r = parseInt(x.slice(0, 2), 16),
      g = parseInt(x.slice(2, 4), 16),
      b = parseInt(x.slice(4, 6), 16)
    const a = x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }
  return null
}

function parseRgbFunc(s: string): RGB | null {
  const m = s.trim().match(/^rgba?\((.+)\)$/i)
  if (!m) return null
  const parts = m[1].split(/\s*,\s*/).map((p) => p.trim())
  if (parts.length < 3 || parts.length > 4) return null
  function parseChan(p: string): number | null {
    if (p.endsWith('%')) {
      const v = Number(p.slice(0, -1))
      if (!Number.isFinite(v)) return null
      return Math.round(clamp01(v / 100) * 255)
    }
    const v = Number(p)
    if (!Number.isFinite(v)) return null
    return p.includes('.')
      ? Math.round(clamp01(v) * 255)
      : Math.max(0, Math.min(255, Math.round(v)))
  }
  const r = parseChan(parts[0])
  const g = parseChan(parts[1])
  const b = parseChan(parts[2])
  if (r == null || g == null || b == null) return null
  let a = 1
  if (parts[3] !== undefined) {
    const av = Number(parts[3])
    if (!Number.isFinite(av)) return null
    a = clamp01(av)
  }
  return { r, g, b, a }
}

function parseHslFunc(s: string): RGB | null {
  const m = s.trim().match(/^hsla?\((.+)\)$/i)
  if (!m) return null
  const parts = m[1].split(/\s*,\s*/).map((p) => p.trim())
  if (parts.length < 3 || parts.length > 4) return null
  const h = Number(parts[0])
  const ss = parts[1].endsWith('%') ? Number(parts[1].slice(0, -1)) / 100 : Number(parts[1])
  const ll = parts[2].endsWith('%') ? Number(parts[2].slice(0, -1)) / 100 : Number(parts[2])
  if (![h, ss, ll].every(Number.isFinite)) return null
  const sClamped = clamp01(ss),
    lClamped = clamp01(ll)
  let a = 1
  if (parts[3] !== undefined) {
    const av = Number(parts[3])
    if (!Number.isFinite(av)) return null
    a = clamp01(av)
  }
  const H = (((h % 360) + 360) % 360) / 360
  const q = lClamped < 0.5 ? lClamped * (1 + sClamped) : lClamped + sClamped - lClamped * sClamped
  const p = 2 * lClamped - q
  const t = (n: number) => {
    let x = n
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  const r = Math.round(t(H + 1 / 3) * 255)
  const g = Math.round(t(H) * 255)
  const b = Math.round(t(H - 1 / 3) * 255)
  return { r, g, b, a }
}

function parseColor(s: string): RGB | null {
  if (!s) return null
  if (s.startsWith('#')) return parseHex(s)
  if (/^rgba?\(/i.test(s)) return parseRgbFunc(s)
  if (/^hsla?\(/i.test(s)) return parseHslFunc(s)
  return parseHex(s)
}

function srgbToLin(c: number): number {
  const cs = c / 255
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}
function relativeLuminance(rgb: RGB): number {
  const R = srgbToLin(rgb.r),
    G = srgbToLin(rgb.g),
    B = srgbToLin(rgb.b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}
function contrastRatio(fg: RGB, bg: RGB): number {
  let f = fg
  if (fg.a !== undefined && fg.a < 1) {
    const a = fg.a
    const comp = (fc: number, bc: number) => Math.round(fc * a + bc * (1 - a))
    f = { r: comp(fg.r, bg.r), g: comp(fg.g, bg.g), b: comp(fg.b, bg.b), a: 1 }
  }
  const L1 = relativeLuminance(f),
    L2 = relativeLuminance(bg)
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

const fgInput = ref<string>('#ffffff')
const bgInput = ref<string>('#0a0a0a')
const fgPicker = ref<string>('#ffffff')
const bgPicker = ref<string>('#0a0a0a')
const errorMsg = ref<string>('')

watch([fgPicker], () => {
  fgInput.value = fgPicker.value
})
watch([bgPicker], () => {
  bgInput.value = bgPicker.value
})

const fg = computed<RGB | null>(() => parseColor(fgInput.value))
const bg = computed<RGB | null>(() => parseColor(bgInput.value))

const ratio = computed<number | null>(() => {
  if (!fg.value || !bg.value) return null
  return Number(contrastRatio(fg.value, bg.value).toFixed(2))
})

const passes = computed(() => {
  if (!ratio.value)
    return { AA_normal: false, AA_large: false, AAA_normal: false, AAA_large: false }
  const r = ratio.value
  return {
    AA_normal: r >= 4.5,
    AA_large: r >= 3,
    AAA_normal: r >= 7,
    AAA_large: r >= 4.5,
  }
})

watch([fg, bg], () => {
  if (!fg.value || !bg.value) {
    errorMsg.value = 'Invalid color input. Use HEX, RGB(A), or HSL(A).'
  } else {
    errorMsg.value = ''
  }
})

const summary = computed(() => {
  if (!ratio.value) return ''
  const p = passes.value
  return [
    `Contrast ratio: ${ratio.value}:1`,
    `AA normal: ${p.AA_normal ? 'PASS' : 'FAIL'}`,
    `AA large: ${p.AA_large ? 'PASS' : 'FAIL'}`,
    `AAA normal: ${p.AAA_normal ? 'PASS' : 'FAIL'}`,
    `AAA large: ${p.AAA_large ? 'PASS' : 'FAIL'}`,
  ].join('\n')
})

async function copySummary() {
  if (!summary.value) return
  try {
    await navigator.clipboard.writeText(summary.value)
    toast('Copied result')
  } catch {}
}
</script>

<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)]">
        <div class="grid content-start gap-5">
          <div class="grid gap-2">
            <Label>Foreground</Label>
            <div class="flex items-center gap-3">
              <input
                v-model="fgPicker"
                type="color"
                class="border-input h-9 w-9 rounded border bg-transparent p-0"
              />
              <Input
                v-model="fgInput"
                placeholder="#ffffff or rgb(255,255,255) or hsl(0,0%,100%)"
                class="h-11"
              />
            </div>
          </div>

          <div class="grid gap-2">
            <Label>Background</Label>
            <div class="flex items-center gap-3">
              <input
                v-model="bgPicker"
                type="color"
                class="border-input h-9 w-9 rounded border bg-transparent p-0"
              />
              <Input
                v-model="bgInput"
                placeholder="#000000 or rgb(0,0,0) or hsl(0,0%,0%)"
                class="h-11"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="text-sm text-red-700 dark:text-red-400">{{ errorMsg }}</div>

          <Separator class="bg-muted" />

          <div class="grid gap-2">
            <Label>Results</Label>
            <div v-if="ratio !== null" class="grid gap-3">
              <div class="text-lg font-medium">
                Contrast ratio:
                <span
                  :class="
                    ratio >= 7
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : ratio >= 4.5
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-red-700 dark:text-red-400'
                  "
                  >{{ ratio }}</span
                >:1
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="border-border rounded border p-3">
                  <div class="text-muted-foreground mb-1">WCAG 2.1 AA</div>
                  <div
                    >Normal text:
                    <span
                      :class="
                        passes.AA_normal
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      "
                      >{{ passes.AA_normal ? 'PASS' : 'FAIL' }}</span
                    ></div
                  >
                  <div
                    >Large text:
                    <span
                      :class="
                        passes.AA_large
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      "
                      >{{ passes.AA_large ? 'PASS' : 'FAIL' }}</span
                    ></div
                  >
                </div>
                <div class="border-border rounded border p-3">
                  <div class="text-muted-foreground mb-1">WCAG 2.1 AAA</div>
                  <div
                    >Normal text:
                    <span
                      :class="
                        passes.AAA_normal
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      "
                      >{{ passes.AAA_normal ? 'PASS' : 'FAIL' }}</span
                    ></div
                  >
                  <div
                    >Large text:
                    <span
                      :class="
                        passes.AAA_large
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-700 dark:text-red-400'
                      "
                      >{{ passes.AAA_large ? 'PASS' : 'FAIL' }}</span
                    ></div
                  >
                </div>
              </div>
              <div class="flex gap-2">
                <Button :disabled="!summary" class="h-11 px-5" @click="copySummary"
                  >Copy summary</Button
                >
              </div>
            </div>
            <div v-else class="text-muted-foreground text-sm"
              >Enter valid colors to see results.</div
            >
          </div>
        </div>

        <div
          class="border-border grid content-start gap-4 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <div class="grid gap-4">
            <Label class="mb-2 block">Preview</Label>
            <div class="grid gap-4">
              <div
                class="border-border border-t pt-3 first:border-t-0 first:pt-0"
                :style="{
                  backgroundColor: bg?.r !== undefined ? `rgb(${bg!.r},${bg!.g},${bg!.b})` : '#000',
                }"
              >
                <div class="grid gap-2">
                  <p
                    class="font-sans"
                    :style="{
                      color: fg?.r !== undefined ? `rgb(${fg!.r},${fg!.g},${fg!.b})` : '#fff',
                      fontSize: '16px',
                      lineHeight: '24px',
                    }"
                  >
                    Normal text preview — 16px regular
                  </p>
                  <p
                    class="font-sans font-semibold"
                    :style="{
                      color: fg?.r !== undefined ? `rgb(${fg!.r},${fg!.g},${fg!.b})` : '#fff',
                      fontSize: '19px',
                      lineHeight: '28px',
                    }"
                  >
                    Large text preview — 19px semibold
                  </p>
                  <p
                    class="font-sans"
                    :style="{
                      color: fg?.r !== undefined ? `rgb(${fg!.r},${fg!.g},${fg!.b})` : '#fff',
                      fontSize: '24px',
                      lineHeight: '32px',
                    }"
                  >
                    Large text preview — 24px
                  </p>
                </div>
              </div>
              <Textarea
                :value="summary"
                rows="5"
                readonly
                class="font-mono text-sm"
                placeholder="Result summary…"
              />
            </div>
          </div>

          <p class="text-muted-foreground text-xs">
            Ratio uses relative luminance per WCAG (sRGB). Large text means ≥24px normal or ≥18.66px
            bold.
          </p>
        </div>
      </div>
    </div>
    <tool-explanation
      title="Color contrast checker"
      intro="Color contrast measures the difference in brightness between foreground text and its background. The WCAG contrast ratio helps determine whether text is readable for a wider range of people."
      detail="Choose foreground and background colors to see a live preview and the ratio between them. The results indicate whether the pair meets WCAG thresholds for normal and large text."
      use-case="Check text colors for websites, apps, buttons and other interface states before using them in a design."
    />
  </ToolLayout>
</template>
