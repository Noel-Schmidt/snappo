<template>
  <tool-layout>
    <div class="space-y-6">
      <div class="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div class="grid content-start gap-6">
          <div
            ref="svRef"
            class="border-border relative aspect-[1.25/1] w-full cursor-crosshair touch-none overflow-hidden rounded-xl border sm:aspect-[1.45/1]"
            :style="svStyle"
            @pointerdown.prevent="startSV"
          >
            <div
              class="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_5px_rgba(0,0,0,0.55)]"
              :style="{
                left: `${sv.x * 100}%`,
                top: `${(1 - sv.y) * 100}%`,
                backgroundColor: rgbaString,
              }"
            />
          </div>

          <div class="grid gap-5">
            <div class="grid gap-2">
              <div class="flex items-center justify-between"
                ><Label>Hue</Label
                ><span class="text-muted-foreground text-xs tabular-nums"
                  >{{ Math.round(h) }}°</span
                ></div
              >
              <div class="h-2.5 w-full rounded-full" :style="{ background: hueGradient }"></div>
              <Slider v-model.number="h" min="0" max="360" aria-label="Hue" />
            </div>
            <div class="grid gap-2">
              <div class="flex items-center justify-between"
                ><Label>Opacity</Label
                ><span class="text-muted-foreground text-xs tabular-nums"
                  >{{ alphaPct }}%</span
                ></div
              >
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
              <Slider v-model.number="alphaPct" min="0" max="100" aria-label="Alpha transparency" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button @click="copy(hexWithAlpha)" class="h-10 px-4">Copy HEX</Button>
            <Button
              variant="outline"
              @click="copy(`rgba(${r}, ${g}, ${b}, ${round(a, 2)})`)"
              class="h-10 px-4"
              >Copy RGBA</Button
            >
            <Button variant="outline" @click="randomize" class="h-10 px-4">Random</Button>
            <div class="text-muted-foreground ml-auto text-xs"
              >WCAG vs #0a0a0a: {{ contrastDark.ratio.toFixed(2) }} ({{ contrastDark.level }})</div
            >
          </div>
        </div>

        <div
          class="border-border grid content-start gap-6 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="hex">HEX</Label>
              <Input
                id="hex"
                v-model="hexInput"
                placeholder="#1f2937 or #1f2937cc"
                @change="onHexChange"
                class="h-11"
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
                  class="h-11"
                />
              </div>
              <div class="grid gap-2">
                <Label for="hsl">HSL</Label>
                <Input
                  id="hsl"
                  v-model="hslInput"
                  placeholder="220,21%,17%,0.80"
                  @change="onHslChange"
                  class="h-11"
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
                class="h-11"
              />
            </div>
          </div>

          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label>Preview</Label>
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="border-border relative flex min-h-20 items-center rounded-xl border p-4"
                  :style="checkerboardStyle"
                >
                  <div
                    class="flex min-h-20 w-full items-center rounded-lg p-3"
                    :style="{ backgroundColor: rgbaString, color: previewTextColor }"
                  >
                    <p class="text-sm">Text on selected color</p>
                  </div>
                </div>
                <div
                  class="border-border flex min-h-20 items-center rounded-xl border bg-white p-4"
                  :style="{ color: `rgb(${r}, ${g}, ${b})` }"
                >
                  <p class="text-sm">Selected text on white</p>
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <Label>Suggestions</Label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="sw in suggestions"
                  :key="sw.key"
                  class="border-border focus-visible:ring-ring h-9 rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
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
                  class="border-border focus-visible:ring-ring h-9 w-9 rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
                  :style="{ backgroundColor: hItem.css }"
                  :title="hItem.hex"
                  @click="apply(hItem)"
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  :disabled="history.length === 0"
                  @click="clearHistory"
                  class="h-11 px-5"
                  >Clear History</Button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <tool-explanation
      title="Online color picker"
      intro="A color picker lets you select a color visually or enter a color value directly. This tool supports common web color formats and includes alpha transparency."
      detail="Adjust hue and transparency, select a point in the color field, or enter a HEX value. Copy the selected color as HEX or RGBA for use in styles and design tokens."
      use-case="Use the picker to explore a color, tune a translucent overlay or transfer a value into CSS."
    />
  </tool-layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

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
const a = ref(1)
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

const { r, g, b } = toRGBfromHSVPlane(h, sv)
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
  if (!dragging) pushHistory({ r: r.value, g: g.value, b: b.value, a: a.value })
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
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', stopSV)
  window.addEventListener('pointercancel', stopSV)
}
function unbindDrag() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', stopSV)
  window.removeEventListener('pointercancel', stopSV)
}

let dragging = false
const onMove = (e: PointerEvent) => {
  if (!dragging || !svRef.value) return
  const rect = svRef.value.getBoundingClientRect()
  const clientX = e.clientX
  const clientY = e.clientY
  const x = (clientX - rect.left) / rect.width
  const y = (clientY - rect.top) / rect.height
  sv.x = clamp(x, 0, 1)
  sv.y = clamp(1 - y, 0, 1)
}
const startSV = (e: PointerEvent) => {
  dragging = true
  svRef.value?.setPointerCapture(e.pointerId)
  onMove(e)
}
const stopSV = () => {
  if (!dragging) return
  dragging = false
  pushHistory({ r: r.value, g: g.value, b: b.value, a: a.value })
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
const previewTextColor = computed(() => {
  const againstBlack = wcagContrast(
    { r: r.value, g: g.value, b: b.value },
    { r: 0, g: 0, b: 0 }
  ).ratio
  const againstWhite = wcagContrast(
    { r: r.value, g: g.value, b: b.value },
    { r: 255, g: 255, b: 255 }
  ).ratio
  return againstBlack > againstWhite ? '#000' : '#fff'
})
const checkerboardStyle = {
  backgroundColor: '#fff',
  backgroundImage:
    'linear-gradient(45deg, #d4d4d8 25%, transparent 25%), linear-gradient(-45deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d8 75%), linear-gradient(-45deg, transparent 75%, #d4d4d8 75%)',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0',
  backgroundSize: '12px 12px',
}

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
  const [hh, ss, vv] = rgbToHsv(nr, ng, nb)
  h.value = hh
  sv.x = ss / 100
  sv.y = vv / 100
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

function toRGBfromHSVPlane(h: any, sv: any) {
  const rr = ref(0),
    gg = ref(0),
    bb = ref(0)
  const calc = () => {
    const s = clamp(sv.x * 100, 0, 100)
    const v = clamp(sv.y * 100, 0, 100)
    const rgb = hsvToRgb(h.value, s, v)
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
  const hex = toHex(r, g, b)
  if (clamp(alpha, 0, 1) >= 1) return hex
  const a8 = Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0')
  return hex + a8
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

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }

  const saturation = max === 0 ? 0 : delta / max
  return [Math.round(mod360(h)), Math.round(saturation * 100), Math.round(max * 100)]
}

function hsvToRgb(h: number, s: number, v: number) {
  s /= 100
  v /= 100
  const chroma = v * s
  const hueSection = mod360(h) / 60
  const x = chroma * (1 - Math.abs((hueSection % 2) - 1))
  const match = v - chroma
  let r = 0
  let g = 0
  let b = 0

  if (hueSection < 1) [r, g, b] = [chroma, x, 0]
  else if (hueSection < 2) [r, g, b] = [x, chroma, 0]
  else if (hueSection < 3) [r, g, b] = [0, chroma, x]
  else if (hueSection < 4) [r, g, b] = [0, x, chroma]
  else if (hueSection < 5) [r, g, b] = [x, 0, chroma]
  else [r, g, b] = [chroma, 0, x]

  return {
    r: Math.round((r + match) * 255),
    g: Math.round((g + match) * 255),
    b: Math.round((b + match) * 255),
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
