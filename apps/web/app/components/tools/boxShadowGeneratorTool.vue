<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'

type Shadow = {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

const boxSize = ref(260)
const bg = ref('#0a0a0a')

const shadows = reactive<Shadow[]>([
  { x: 0, y: 12, blur: 24, spread: -6, color: '#000000', opacity: 0.35, inset: false },
])

function addShadow() {
  shadows.push({ x: 0, y: 8, blur: 16, spread: -4, color: '#000000', opacity: 0.25, inset: false })
}
function removeShadow(i: number) {
  shadows.splice(i, 1)
}
function moveUp(i: number) {
  if (i <= 0) return
  const s = shadows.splice(i, 1)[0]
  shadows.splice(i - 1, 0, s)
}
function moveDown(i: number) {
  if (i >= shadows.length - 1) return
  const s = shadows.splice(i, 1)[0]
  shadows.splice(i + 1, 0, s)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const x = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{3,6}$/.test(x)) return null
  const h =
    x.length === 3
      ? x
          .split('')
          .map((c) => c + c)
          .join('')
      : x
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}
function rgbaString(hex: string, a: number): string {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }
  const aa = Math.min(1, Math.max(0, Number(a) || 0))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${aa})`
}
function shadowToCss(s: Shadow): string {
  const col = rgbaString(s.color, s.opacity)
  const parts = [`${s.x}px`, `${s.y}px`, `${s.blur}px`, `${s.spread}px`, col]
  const base = parts.join(' ')
  return s.inset ? `inset ${base}` : base
}
const cssValue = computed(() => shadows.map(shadowToCss).join(', '))
const cssText = computed(() => `box-shadow: ${cssValue.value};`)

const previewStyle = computed(() => ({
  width: `${boxSize.value}px`,
  height: `${boxSize.value}px`,
  backgroundColor: '#111318',
  borderRadius: '16px',
  boxShadow: cssValue.value,
}))

async function copyCss() {
  try {
    await navigator.clipboard.writeText(cssText.value)
    toast('Copied CSS')
  } catch {}
}

type Preset = { label: string; apply: () => void }
const presets: Preset[] = [
  {
    label: 'Soft shadow',
    apply: () => {
      shadows.splice(
        0,
        shadows.length,
        { x: 0, y: 10, blur: 30, spread: -10, color: '#000000', opacity: 0.35, inset: false },
        { x: 0, y: 2, blur: 6, spread: 0, color: '#000000', opacity: 0.12, inset: false }
      )
    },
  },
  {
    label: 'Hard shadow',
    apply: () => {
      shadows.splice(0, shadows.length, {
        x: 8,
        y: 8,
        blur: 0,
        spread: 0,
        color: '#000000',
        opacity: 0.4,
        inset: false,
      })
    },
  },
  {
    label: 'Neumorphism',
    apply: () => {
      bg.value = '#0f1220'
      shadows.splice(
        0,
        shadows.length,
        { x: 12, y: 12, blur: 24, spread: 0, color: '#000000', opacity: 0.45, inset: false },
        { x: -12, y: -12, blur: 24, spread: 0, color: '#3a3f67', opacity: 0.25, inset: false },
        { x: 0, y: 0, blur: 0, spread: 2, color: '#ffffff', opacity: 0.04, inset: true }
      )
    },
  },
]
</script>

<template>
  <ToolLayout>
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
      <div class="grid content-start gap-6">
        <div class="grid content-start gap-6">
          <div class="grid gap-2">
            <Label>Presets</Label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="p in presets"
                :key="p.label"
                variant="outline"
                class="h-9 px-3"
                @click="p.apply()"
              >
                {{ p.label }}
              </Button>
              <Button
                variant="ghost"
                class="h-9 px-3"
                @click="
                  () =>
                    shadows.splice(0, shadows.length, {
                      x: 0,
                      y: 12,
                      blur: 24,
                      spread: -6,
                      color: '#000000',
                      opacity: 0.35,
                      inset: false,
                    })
                "
                >Reset</Button
              >
            </div>
          </div>

          <div class="grid gap-4">
            <div
              v-for="(s, i) in shadows"
              :key="i"
              class="border-border border-t pt-4 first:border-t-0 first:pt-0"
            >
              <div class="mb-3 flex items-center justify-between">
                <Label>Shadow {{ i + 1 }}</Label>
                <div class="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="moveUp(i)"
                    :disabled="i === 0"
                    class="h-11 px-5"
                    >↑</Button
                  >
                  <Button
                    size="sm"
                    variant="outline"
                    @click="moveDown(i)"
                    :disabled="i === shadows.length - 1"
                    class="h-11 px-5"
                    >↓</Button
                  >
                  <Button
                    size="sm"
                    variant="outline"
                    @click="removeShadow(i)"
                    :disabled="shadows.length === 1"
                    class="h-11 px-5"
                    >Remove</Button
                  >
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="grid gap-2">
                  <Label>Horizontal offset</Label>
                  <div class="flex items-center gap-3">
                    <Slider
                      v-model.number="s.x"
                      min="-100"
                      max="100"
                      step="1"
                      aria-label="Horizontal shadow offset"
                    />
                    <Input type="number" class="h-11 w-24" v-model.number="s.x" />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Vertical offset</Label>
                  <div class="flex items-center gap-3">
                    <Slider
                      v-model.number="s.y"
                      min="-100"
                      max="100"
                      step="1"
                      aria-label="Vertical shadow offset"
                    />
                    <Input type="number" class="h-11 w-24" v-model.number="s.y" />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Blur radius</Label>
                  <div class="flex items-center gap-3">
                    <Slider
                      v-model.number="s.blur"
                      min="0"
                      max="200"
                      step="1"
                      aria-label="Shadow blur"
                    />
                    <Input type="number" class="h-11 w-24" v-model.number="s.blur" />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Spread radius</Label>
                  <div class="flex items-center gap-3">
                    <Slider
                      v-model.number="s.spread"
                      min="-100"
                      max="100"
                      step="1"
                      aria-label="Shadow spread"
                    />
                    <Input type="number" class="h-11 w-24" v-model.number="s.spread" />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Color</Label>
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      v-model="s.color"
                      class="border-input h-9 w-9 rounded border bg-transparent p-0"
                    />
                    <Input v-model="s.color" placeholder="#000000" class="h-11" />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Opacity</Label>
                  <div class="flex items-center gap-3">
                    <Slider
                      v-model.number="s.opacity"
                      min="0"
                      max="1"
                      step="0.01"
                      aria-label="Shadow opacity"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      class="h-11 w-24"
                      v-model.number="s.opacity"
                    />
                  </div>
                </div>

                <div class="grid gap-2">
                  <Label>Inset</Label>
                  <div
                    class="border-border flex items-center justify-between rounded border px-3 py-2"
                  >
                    <span class="text-foreground/80 text-sm">Inset shadow</span>
                    <Switch v-model:checked="s.inset" />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" class="h-11 w-full px-5" @click="addShadow"
              >Add shadow</Button
            >
          </div>

          <Separator class="bg-muted" />

          <div class="grid gap-2">
            <Label>Generated CSS</Label>
            <Textarea :value="cssText" rows="3" readonly class="font-mono text-sm" />
            <div class="flex gap-2">
              <Button @click="copyCss" class="h-11 px-5">Copy CSS</Button>
            </div>
          </div>
        </div>
      </div>

      <div
        class="border-border grid content-start gap-6 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
      >
        <div class="grid gap-6">
          <div class="grid gap-2">
            <Label for="bgc">Preview background</Label>
            <div class="flex items-center gap-3">
              <input
                id="bgc"
                type="color"
                v-model="bg"
                class="border-input h-9 w-9 rounded border bg-transparent p-0"
              />
              <Input v-model="bg" class="h-11 w-40" />
              <div class="ml-auto flex items-center gap-3">
                <Label for="size">Preview size</Label>
                <Slider v-model.number="boxSize" min="160" max="420" step="1" aria-label="size" />
                <Input type="number" class="h-11 w-20" v-model.number="boxSize" />
              </div>
            </div>
          </div>

          <div
            class="flex min-h-[320px] items-center justify-center p-6"
            :style="{ backgroundColor: bg }"
          >
            <div :style="previewStyle" />
          </div>
        </div>
      </div>
    </div>
    <tool-explanation
      title="CSS box-shadow generator"
      intro="The CSS box-shadow property adds one or more shadows to an element. Each layer can set horizontal and vertical offset, blur, spread, color and opacity."
      detail="This generator updates the preview as you edit layers. Combine outer or inset shadows to build a complete effect, then copy the resulting CSS declaration."
      use-case="Use it to tune elevation for cards, buttons, dialogs and other interface elements."
    />
  </ToolLayout>
</template>
