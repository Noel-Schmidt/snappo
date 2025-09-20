<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-6 md:grid-cols-12">
        <div class="md:col-span-4">
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
            <div class="grid gap-5">
              <div class="grid gap-2">
                <Label for="color">Start color</Label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="colorPicker"
                    type="color"
                    class="h-10 w-10 rounded-md border border-neutral-800 bg-neutral-950 p-0"
                  />
                  <Input
                    id="color"
                    v-model="colorInput"
                    placeholder="#22c55e | rgb(34,197,94) | hsl(146 64% 45%)"
                    class="h-10"
                  />
                  <Button variant="outline" class="h-10" @click="onUse">Use</Button>
                </div>
                <p v-if="parseError" class="text-xs text-red-400">{{ parseError }}</p>
              </div>

              <div class="grid gap-2">
                <Label>From image</Label>
                <ClientOnly>
                  <div class="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      class="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-neutral-800 file:bg-neutral-950 file:px-3 file:py-2 file:text-neutral-200"
                      @change="onImage"
                    />
                    <Button
                      variant="outline"
                      class="h-10"
                      :disabled="imageColors.length === 0"
                      @click="useImageTop"
                      >Use top</Button
                    >
                  </div>
                </ClientOnly>
                <p class="text-xs text-neutral-500">Extract dominant colors.</p>
              </div>

              <div class="grid gap-2">
                <Label for="steps">Shades & tints steps</Label>
                <div class="flex items-center gap-2">
                  <Input
                    id="steps"
                    v-model.number="steps"
                    type="number"
                    min="2"
                    max="8"
                    class="h-10 w-24"
                  />
                  <span class="text-xs text-neutral-400">2–8</span>
                </div>
              </div>

              <div class="grid gap-2">
                <Label>Preview</Label>
                <div
                  class="h-20 w-full rounded-lg border border-neutral-800"
                  :style="{ background: rgbHex(base) }"
                ></div>
                <p class="text-xs text-neutral-400">{{ rgbHex(base) }}</p>
              </div>

              <ClientOnly>
                <div v-if="imageColors.length > 0" class="grid gap-2">
                  <Label>Image colors</Label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="(c, i) in imageColors"
                      :key="i"
                      class="group relative h-10 w-10 overflow-hidden rounded-md border border-neutral-800"
                      :style="{ background: rgbHex(c) }"
                      :title="rgbHex(c)"
                      @click="
                        setBase(c)
                        toast('Base color set', { description: rgbHex(c) })
                      "
                    >
                      <span
                        class="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/40 p-0.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
                        >{{ rgbHex(c) }}</span
                      >
                    </button>
                  </div>
                </div>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div class="md:col-span-8">
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
            <div class="grid gap-8">
              <div class="grid gap-6 md:grid-cols-2">
                <PaletteRow label="Complementary" :colors="palettes.complementary" />
                <PaletteRow label="Analogous" :colors="palettes.analogous" />
                <PaletteRow label="Triadic" :colors="palettes.triadic" />
                <PaletteRow label="Tetradic" :colors="palettes.tetradic" />
              </div>
              <div
                class="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent"
              ></div>
              <PaletteRow label="Monochromatic" :colors="palettes.mono" />
              <PaletteRow label="Shades & Tints" :colors="palettes.shadesTints" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

import PaletteRow from '@/components/tools/paletteGenerator/paletteRow.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RGB } from '~/lib/color'
import {
  rgbHex,
  hexToRgb,
  parseColor,
  rotateHue,
  mono,
  shadesTints,
  kmeansTopColors,
  scaleToFit,
} from '~/lib/color'

const initial: string = '#22c55e'
const colorInput = ref<string>(initial)
const colorPicker = ref<string>(initial)
const parseError = ref<string>('')
const base = ref<RGB>(hexToRgb(initial))
const imageColors = ref<RGB[]>([])
const steps = ref<number>(4)

function onUse(): void {
  const rgb = hexToRgb(colorPicker.value)
  setBase(rgb)
  toast('Base color set', { description: rgbHex(rgb) })
}
function setBase(rgb: RGB): void {
  base.value = { r: rgb.r | 0, g: rgb.g | 0, b: rgb.b | 0 }
  const hex = rgbHex(base.value)
  colorInput.value = hex
  colorPicker.value = hex
}
function useImageTop(): void {
  if (imageColors.value.length > 0) setBase(imageColors.value[0]!)
}

watch(colorInput, (v) => {
  const parsed = parseColor(v)
  if (parsed) {
    parseError.value = ''
    setBase(parsed)
  } else {
    parseError.value = 'Invalid color. Use HEX, rgb(), or hsl().'
  }
})

const palettes = reactive({
  complementary: computed<RGB[]>(() => [base.value, rotateHue(base.value, 180)]),
  analogous: computed<RGB[]>(() => [
    rotateHue(base.value, -30),
    base.value,
    rotateHue(base.value, 30),
  ]),
  triadic: computed<RGB[]>(() => [
    base.value,
    rotateHue(base.value, 120),
    rotateHue(base.value, -120),
  ]),
  tetradic: computed<RGB[]>(() => [
    base.value,
    rotateHue(base.value, 90),
    rotateHue(base.value, 180),
    rotateHue(base.value, 270),
  ]),
  mono: computed<RGB[]>(() => mono(base.value, 6)),
  shadesTints: computed<RGB[]>(() => {
    const n = Math.min(8, Math.max(2, Number.isFinite(steps.value) ? steps.value : 4))
    return shadesTints(base.value, n)
  }),
})

async function onImage(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement | null
  const file = input?.files && input.files[0] ? input.files[0] : null
  if (!file) return
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  try {
    await img.decode()
    const size = scaleToFit(img.width, img.height, 120, 120)
    const cvs = document.createElement('canvas')
    cvs.width = size.width
    cvs.height = size.height
    const ctx = cvs.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return
    }
    ctx.drawImage(img, 0, 0, size.width, size.height)
    const imgData = ctx.getImageData(0, 0, size.width, size.height)
    imageColors.value = kmeansTopColors(imgData.data, 5, 8, base.value)
  } catch {
  } finally {
    URL.revokeObjectURL(url)
  }
}
</script>
