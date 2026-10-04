<template>
  <ToolLayout>
    <div class="grid gap-8 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.25fr)]">
      <aside
        class="border-border grid content-start gap-6 border-b pb-6 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-6"
      >
        <div class="grid gap-1"
          ><h2 class="text-base font-semibold">Choose a starting color</h2
          ><p class="text-muted-foreground text-sm">Every harmony updates as you adjust it.</p></div
        >
        <div class="grid gap-3">
          <Label for="palette-color">Base color</Label>
          <div class="flex items-center gap-3">
            <input
              id="palette-color-picker"
              v-model="colorPicker"
              type="color"
              aria-label="Choose base color"
              class="border-border h-12 w-14 cursor-pointer rounded-lg border bg-transparent p-1"
              @input="onPicker"
            />
            <Input
              id="palette-color"
              v-model="colorInput"
              placeholder="#22c55e or rgb(34,197,94)"
              class="h-11 min-w-0 font-mono"
            />
          </div>
          <p v-if="parseError" class="text-destructive text-sm" role="alert">{{ parseError }}</p>
          <Button variant="ghost" class="h-9 w-full" @click="randomize">Random color</Button>
        </div>
        <div class="border-border grid gap-3 border-t pt-5">
          <Label for="palette-image">Extract colors from an image</Label>
          <ClientOnly
            ><input
              id="palette-image"
              type="file"
              accept="image/*"
              class="file:border-border file:bg-background file:text-foreground block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-2"
              @change="onImage"
          /></ClientOnly>
          <p class="text-muted-foreground text-xs"
            >The image is analyzed in this browser and is never uploaded.</p
          >
          <p v-if="imageError" class="text-destructive text-sm" role="alert">{{ imageError }}</p>
          <div v-if="imageColors.length" class="grid gap-2">
            <p class="text-sm font-medium">Dominant colors</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(c, i) in imageColors"
                :key="i"
                class="border-border focus-visible:ring-ring h-12 w-12 rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :style="{ backgroundColor: rgbHex(c) }"
                :aria-label="'Use image color ' + rgbHex(c)"
                :title="'Use ' + rgbHex(c)"
                @click="onPickFromImage(c)"
              />
              <Button variant="outline" class="h-12 px-3" @click="useImageTop">Use first</Button>
            </div>
          </div>
        </div>
        <div class="border-border grid gap-2 border-t pt-5">
          <Label for="steps">Shade and tint count</Label>
          <Input
            id="steps"
            v-model.number="steps"
            type="number"
            min="2"
            max="8"
            class="h-11 w-24"
          />
          <p class="text-muted-foreground text-xs"
            >Choose between 2 and 8 lighter or darker variations.</p
          >
        </div>
      </aside>
      <div class="grid content-start gap-8">
        <section class="grid gap-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="grid gap-1"
              ><h2 class="text-lg font-semibold">Your palette</h2
              ><p class="text-muted-foreground text-sm"
                >Select any color to copy its HEX value.</p
              ></div
            >
            <Button variant="outline" class="h-10" @click="copyPalette">Copy CSS variables</Button>
          </div>
          <div class="grid sm:grid-cols-[8rem_minmax(0,1fr)]">
            <div
              class="min-h-28 sm:min-h-32"
              :style="{ backgroundColor: rgbHex(base) }"
              role="img"
              :aria-label="'Base color preview ' + rgbHex(base)"
            />
            <div class="grid content-center gap-2 py-4 sm:px-5"
              ><p class="text-muted-foreground text-sm">Starting color</p
              ><p class="font-mono text-2xl font-semibold uppercase tracking-tight">{{
                rgbHex(base)
              }}</p
              ><p class="text-muted-foreground text-sm"
                >{{ base.r }}, {{ base.g }}, {{ base.b }} | RGB</p
              ></div
            >
          </div>
        </section>
        <section class="grid gap-5">
          <h2 class="text-base font-semibold">Color harmonies</h2>
          <div class="grid gap-x-6 gap-y-7 sm:grid-cols-2">
            <PaletteRow label="Complementary" :colors="palettes.complementary" /><PaletteRow
              label="Analogous"
              :colors="palettes.analogous"
            /><PaletteRow label="Triadic" :colors="palettes.triadic" /><PaletteRow
              label="Tetradic"
              :colors="palettes.tetradic"
            />
          </div>
        </section>
        <section class="border-border grid gap-5 border-t pt-6">
          <h2 class="text-base font-semibold">Color variations</h2>
          <div class="grid gap-x-6 gap-y-7 sm:grid-cols-2"
            ><PaletteRow label="Monochromatic" :colors="palettes.mono" /><PaletteRow
              label="Shades and tints"
              :colors="palettes.shadesTints"
          /></div>
        </section>
      </div>
    </div>
    <ToolExplanation
      title="About color palettes"
      intro="Color harmonies are built by shifting hue around a starting color. Monochromatic palettes vary lightness while keeping the hue similar."
      detail="Click any swatch to copy its HEX value, or export the complete set as CSS custom properties. Image colors are extracted locally in your browser."
      use-case="Explore coordinated colors for interface themes, illustrations, and other design work."
    />
  </ToolLayout>
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
const imageError = ref('')
const steps = ref<number>(4)

function onPicker(event: Event): void {
  const input = event.target as HTMLInputElement | null
  if (input) colorInput.value = input.value
}

function randomize(): void {
  const values = crypto.getRandomValues(new Uint8Array(3))
  setBase({ r: values[0]!, g: values[1]!, b: values[2]! })
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

function onPickFromImage(c: RGB): void {
  setBase(c)
  toast('Base color set', { description: rgbHex(c) })
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

const paletteGroups = computed(() => [
  { name: 'base', colors: [base.value] },
  { name: 'complementary', colors: palettes.complementary },
  { name: 'analogous', colors: palettes.analogous },
  { name: 'triadic', colors: palettes.triadic },
  { name: 'tetradic', colors: palettes.tetradic },
  { name: 'monochromatic', colors: palettes.mono },
  { name: 'shades-tints', colors: palettes.shadesTints },
])

async function copyPalette(): Promise<void> {
  const newline = String.fromCharCode(10)
  const declarations = paletteGroups.value.flatMap(({ name, colors }) =>
    colors.map(
      (color, index) => '  --color-' + name + '-' + (index + 1) + ': ' + rgbHex(color) + ';'
    )
  )
  const css = ':root {' + newline + declarations.join(newline) + newline + '}'
  try {
    await navigator.clipboard.writeText(css)
    toast('Palette copied as CSS variables')
  } catch {
    toast('Could not copy palette', { description: 'Check clipboard permissions and try again.' })
  }
}

async function onImage(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement | null
  const file = input?.files && input.files[0] ? input.files[0] : null
  if (!file) return
  imageError.value = ''
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
      imageError.value = 'This image could not be read. Try another image file.'
      URL.revokeObjectURL(url)
      return
    }
    ctx.drawImage(img, 0, 0, size.width, size.height)
    const imgData = ctx.getImageData(0, 0, size.width, size.height)
    imageColors.value = kmeansTopColors(imgData.data, 5, 8, base.value)
  } catch {
    imageError.value = 'This image could not be read. Try another image file.'
  } finally {
    URL.revokeObjectURL(url)
  }
}
</script>
