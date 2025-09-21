<template>
  <tool-layout>
    <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <div class="grid gap-8 md:grid-cols-2">
        <div class="grid gap-6">
          <div
            ref="svRef"
            class="relative aspect-square w-full rounded-lg border border-neutral-800"
            :style="svStyle"
            @mousedown="startSV"
            @touchstart.prevent="startSV"
          >
            <div
              class="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
              :style="{
                left: `${sv.x * 100}%`,
                top: `${(1 - sv.y) * 100}%`,
                backgroundColor: rgbaString,
              }"
            />
          </div>

          <div class="grid gap-4">
            <div class="grid gap-1">
              <Label>Hue</Label>
              <div class="h-3 w-full rounded-full" :style="{ background: hueGradient }"></div>
              <input
                v-model.number="h"
                type="range"
                min="0"
                max="360"
                class="w-full accent-neutral-300"
              />
            </div>
            <div class="grid gap-1">
              <Label>Alpha</Label>
              <div class="relative h-3 w-full overflow-hidden rounded-full">
                <div
                  class="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] opacity-20 [background-position:0_0,0_5px,5px_-5px,-5px_0] [background-size:10px_10px]"
                ></div>
                <div
                  class="absolute inset-0 rounded-full"
                  :style="{
                    background: `linear-gradient(90deg, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
                  }"
                ></div>
              </div>
              <input
                v-model.number="alphaPct"
                type="range"
                min="0"
                max="100"
                class="w-full accent-neutral-300"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Button @click="copy(hexWithAlpha)">Copy HEX</Button>
            <Button variant="outline" @click="copy(`rgba(${r}, ${g}, ${b}, ${round(a, 2)})`)"
              >Copy RGBA</Button
            >
            <Button variant="outline" @click="randomize">Random</Button>
            <div class="ml-auto text-xs text-neutral-400"
              >WCAG vs #0a0a0a: {{ contrastDark.ratio.toFixed(2) }} ({{ contrastDark.level }})</div
            >
          </div>
        </div>

        <div class="grid gap-6">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="hex">HEX</Label>
              <Input
                id="hex"
                v-model="hexInput"
                placeholder="#1f2937 or #1f2937cc"
                @change="onHexChange"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="rgba">RGBA</Label>
                <Input
                  id="rgba"
                  v-model="rgbaInput"
                  placeholder="31,41,55,0.80"
                  @change="onRgbaChange"
                />
              </div>
              <div class="grid gap-2">
                <Label for="hsl">HSL</Label>
                <Input
                  id="hsl"
                  v-model="hslInput"
                  placeholder="220,21%,17%,0.80"
                  @change="onHslChange"
                />
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="oklch">OKLCH</Label>
              <Input
                id="oklch"
                v-model="oklchInput"
                placeholder="0.65 0.10 220 / 0.9"
                @change="onOklchChange"
              />
            </div>
          </div>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label>Preview</Label>
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-lg border border-neutral-800 p-4"
                  :style="{ backgroundColor: rgbaString }"
                >
                  <p class="text-sm text-white">On color</p>
                </div>
                <div
                  class="rounded-lg border border-neutral-800 bg-white p-4"
                  :style="{ color: rgbaString }"
                >
                  <p class="text-sm">On white</p>
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <Label>Suggestions</Label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="sw in suggestions"
                  :key="sw.key"
                  class="h-8 rounded-md border border-neutral-800"
                  :style="{ backgroundColor: sw.css }"
                  :title="sw.label"
                  @click="apply(sw)"
                />
              </div>
            </div>

            <div class="grid gap-2">
              <Label>History</Label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(hItem, i) in history"
                  :key="i"
                  class="h-8 w-8 rounded-md border border-neutral-800"
                  :style="{ backgroundColor: hItem.css }"
                  :title="hItem.hex"
                  @click="apply(hItem)"
                />
              </div>
              <div>
                <Button variant="outline" :disabled="history.length === 0" @click="clearHistory"
                  >Clear History</Button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Swatch = {
  r: number
  g: number
  b: number
  a: number
  hex: string
  css: string
  key?: string
  label?: string
}

const h = ref(220)
const sv = reactive({ x: 0.21, y: 0.17 })
const a = ref(0.9)
const svRef = ref<HTMLElement | null>(null)

const LS_KEY = 'snappo-color-history'
const history = ref<Swatch[]>(process.client ? loadHistory() : [])

function pushHistory(s: { r: number; g: number; b: number; a: number }) {
  if (!process.client) return
  const hex = toHex(s.r, s.g, s.b)
  const item: Swatch = { ...s, hex, css: `rgba(${s.r}, ${s.g}, ${s.b}, ${round(s.a, 2)})` }
  const key = `${s.r},${s.g},${s.b},${Math.round(s.a * 100)}`
  const filtered = history.value.filter(
    (h) => `${h.r},${h.g},${h.b},${Math.round(h.a * 100)}` !== key
  )
  history.value = [item, ...filtered].slice(0, 12)
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(history.value))
  } catch {}
}
function loadHistory(): Swatch[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]').slice(0, 12)
  } catch {
    return []
  }
}
function clearHistory() {
  if (!process.client) return
  history.value = []
  localStorage.removeItem(LS_KEY)
}

const { r, g, b } = toRGBfromHSLPlane(h, sv)
const rgbaString = computed(() => `rgba(${r.value}, ${g.value}, ${b.value}, ${round(a.value, 2)})`)
const hexWithAlpha = computed(() => toHexWithAlpha(r.value, g.value, b.value, a.value))

const hexInput = ref('')
const rgbaInput = ref('')
const hslInput = ref('')
const oklchInput = ref('')

function syncInputs() {
  hexInput.value = toHexWithAlpha(r.value, g.value, b.value, a.value)
  rgbaInput.value = `${r.value},${g.value},${b.value},${round(a.value, 2)}`
  const [hh, ss, ll] = rgbToHsl(r.value, g.value, b.value)
  hslInput.value = `${hh},${ss}%,${ll}%,${round(a.value, 2)}`
  const o = rgbToOklch(r.value, g.value, b.value)
  oklchInput.value = `${round(o.l, 3)} ${round(o.c, 3)} ${round(o.h, 1)} / ${round(a.value, 2)}`
  pushHistory({ r: r.value, g: g.value, b: b.value, a: a.value })
}

watch([r, g, b, a], () => {
  if (process.client) syncInputs()
})

onMounted(() => {
  syncInputs()
  bindDrag()
})
onBeforeUnmount(unbindDrag)

function bindDrag() {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopSV)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', stopSV)
}
function unbindDrag() {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopSV)
  window.removeEventListener('touchmove', onMove as any)
  window.removeEventListener('touchend', stopSV)
}

let dragging = false
const onMove = (e: MouseEvent | TouchEvent) => {
  if (!dragging || !svRef.value) return
  const rect = svRef.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  const x = (clientX - rect.left) / rect.width
  const y = (clientY - rect.top) / rect.height
  sv.x = clamp(x, 0, 1)
  sv.y = clamp(1 - y, 0, 1)
}
const startSV = (e: MouseEvent | TouchEvent) => {
  dragging = true
  onMove(e)
}
const stopSV = () => {
  dragging = false
}

const hueGradient = computed(
  () =>
    `linear-gradient(90deg,
    hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,40%),
    hsl(180,100%,40%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`
)
const svStyle = computed(() => {
  const base = `hsl(${h.value}, 100%, 50%)`
  return {
    background: `
      linear-gradient(to top, #000, transparent),
      linear-gradient(to right, #fff, ${base})
    `,
  }
})

const alphaPct = computed({
  get: () => Math.round(a.value * 100),
  set: (v: number) => (a.value = clamp(v, 0, 100) / 100),
})

const suggestions = computed<Swatch[]>(() => {
  const arr: Swatch[] = []
  const [hh, ss, ll] = rgbToHsl(r.value, g.value, b.value)
  const push = (rgb: { r: number; g: number; b: number }, label: string, key: string) =>
    arr.push({
      ...rgb,
      a: 1,
      hex: toHex(rgb.r, rgb.g, rgb.b),
      css: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      label,
      key,
    })
  push(hslToRgb((hh + 180) % 360, ss, ll), 'complement', 'c')
  push(hslToRgb((hh + 120) % 360, ss, ll), 'triad-1', 't1')
  push(hslToRgb((hh + 240) % 360, ss, ll), 'triad-2', 't2')
  push(hslToRgb(hh, ss, clamp(ll * 0.6, 0, 100)), 'shade', 's1')
  push(hslToRgb(hh, ss, clamp(ll * 1.25, 0, 100)), 'tint', 't1n')
  return arr.slice(0, 12)
})

const contrastDark = computed(() =>
  wcagContrast({ r: r.value, g: g.value, b: b.value }, { r: 10, g: 10, b: 10 })
)

function onHexChange() {
  const parsed = parseHexAny(hexInput.value.trim())
  if (!parsed) return
  setFromRGB(parsed.r, parsed.g, parsed.b, parsed.a)
}
function onRgbaChange() {
  const m = rgbaInput.value.split(',').map((v) => v.trim())
  if (m.length < 3) return
  const nr = clamp(parseInt(m[0]), 0, 255),
    ng = clamp(parseInt(m[1]), 0, 255),
    nb = clamp(parseInt(m[2]), 0, 255)
  const na = m[3] != null ? clamp(parseFloat(m[3]), 0, 1) : a.value
  setFromRGB(nr, ng, nb, na)
}
function onHslChange() {
  const m = hslInput.value.split(',').map((v) => v.trim().replace('%', ''))
  if (m.length < 3) return
  const hh = mod360(parseFloat(m[0]))
  const ss = clamp(parseFloat(m[1]), 0, 100)
  const ll = clamp(parseFloat(m[2]), 0, 100)
  const na = m[3] != null ? clamp(parseFloat(m[3]), 0, 1) : a.value
  const rgb = hslToRgb(hh, ss, ll)
  setFromRGB(rgb.r, rgb.g, rgb.b, na)
}
function onOklchChange() {
  const raw = oklchInput.value.replace(/\//, ' ').split(/\s+/).filter(Boolean)
  if (raw.length < 3) return
  const l = parseFloat(raw[0]),
    c = parseFloat(raw[1]),
    hh = parseFloat(raw[2])
  const na = raw[3] ? clamp(parseFloat(raw[3]), 0, 1) : a.value
  const rgb = oklchToRgb(l, c, hh)
  setFromRGB(rgb.r, rgb.g, rgb.b, na)
}

function setFromRGB(nr: number, ng: number, nb: number, na: number) {
  r.value = nr
  g.value = ng
  b.value = nb
  a.value = na
  const [hh, ss, ll] = rgbToHsl(nr, ng, nb)
  h.value = hh
  sv.x = ss / 100
  sv.y = ll / 100
}

function apply(sw: Swatch) {
  r.value = sw.r
  g.value = sw.g
  b.value = sw.b
  a.value = sw.a ?? 1
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}
function randomize() {
  h.value = Math.floor(Math.random() * 360)
  sv.x = Math.random()
  sv.y = Math.random()
  a.value = round(Math.random(), 2)
}

function toRGBfromHSLPlane(h: any, sv: any) {
  const rr = ref(0),
    gg = ref(0),
    bb = ref(0)
  const calc = () => {
    const s = clamp(sv.x * 100, 0, 100)
    const l = clamp(sv.y * 100, 0, 100)
    const rgb = hslToRgb(h.value, s, l)
    rr.value = rgb.r
    gg.value = rgb.g
    bb.value = rgb.b
  }
  watch([h, () => sv.x, () => sv.y], calc, { immediate: true })
  return { r: rr, g: gg, b: bb }
}

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}
function toHexWithAlpha(r: number, g: number, b: number, alpha: number) {
  const a8 = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0')
  return toHex(r, g, b) + a8
}
function parseHexAny(v: string) {
  const s = v.startsWith('#') ? v : `#${v}`
  if (/^#([a-f\d]{6})$/i.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
      a: a.value,
    }
  }
  if (/^#([a-f\d]{8})$/i.test(s)) {
    return {
      r: parseInt(s.slice(1, 3), 16),
      g: parseInt(s.slice(3, 5), 16),
      b: parseInt(s.slice(5, 7), 16),
      a: parseInt(s.slice(7, 9), 16) / 255,
    }
  }
  return null
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
  }
  return [Math.round(h) % 360, Math.round(s * 100), Math.round(l * 100)]
}
function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToOklch(r: number, g: number, b: number) {
  const lab = rgbToOklab(r, g, b)
  const h = ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b)
  return { l: lab.l, c, h }
}
function oklchToRgb(l: number, c: number, h: number) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  return oklabToRgb({ l, a, b })
}
function rgbToOklab(r: number, g: number, b: number) {
  const sr = srgbToLinear(r / 255),
    sg = srgbToLinear(g / 255),
    sb = srgbToLinear(b / 255)
  const L = 0.4122214708 * sr + 0.5363325363 * sg + 0.0514459929 * sb
  const M = 0.2119034982 * sr + 0.6806995451 * sg + 0.1073969566 * sb
  const S = 0.0883024619 * sr + 0.2817188376 * sg + 0.6299787005 * sb
  const l_ = Math.cbrt(L),
    m_ = Math.cbrt(M),
    s_ = Math.cbrt(S)
  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  }
}
function oklabToRgb({ l, a, b }: { l: number; a: number; b: number }) {
  const L = l + 0.3963377774 * a + 0.2158037573 * b
  const M = l - 0.1055613458 * a - 0.0638541728 * b
  const S = l - 0.0894841775 * a - 1.291485548 * b
  const L3 = L * L * L,
    M3 = M * M * M,
    S3 = S * S * S
  const lr = 4.0767416621 * L3 - 3.3077115913 * M3 + 0.2309699292 * S3
  const lg = -1.2684380046 * L3 + 2.6097574011 * M3 - 0.3413193965 * S3
  const lb = -0.0041960863 * L3 - 0.7034186147 * M3 + 1.707614701 * S3
  const sr = linearToSrgb(lr),
    sg = linearToSrgb(lg),
    sb = linearToSrgb(lb)
  return {
    r: clamp(Math.round(sr * 255), 0, 255),
    g: clamp(Math.round(sg * 255), 0, 255),
    b: clamp(Math.round(sb * 255), 0, 255),
  }
}
function srgbToLinear(u: number) {
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)
}
function linearToSrgb(u: number) {
  return u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055
}

function wcagContrast(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
) {
  const rel = (rgb: { r: number; g: number; b: number }) => {
    const s = [rgb.r, rgb.g, rgb.b]
      .map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]
  }
  const L1 = rel(fg) + 0.05,
    L2 = rel(bg) + 0.05
  const ratio = L1 > L2 ? L1 / L2 : L2 / L1
  const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  return { ratio, level }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
function round(v: number, p = 2) {
  const m = 10 ** p
  return Math.round(v * m) / m
}
function mod360(x: number) {
  return ((x % 360) + 360) % 360
}
</script>
