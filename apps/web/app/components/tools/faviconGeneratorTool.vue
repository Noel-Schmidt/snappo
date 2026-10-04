<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Asset = { name: string; blob: Blob; url: string; size: number }
const source = ref<HTMLImageElement | null>(null)
const sourceUrl = ref('')
const filename = ref('')
const error = ref('')
const generated = ref(false)
const busy = ref(false)
const dragOver = ref(false)
const padding = ref(12)
const radius = ref(18)
const background = ref('#ffffff')
const theme = ref('#0f766e')
const tint = ref('#0f172a')
const siteName = ref('My Website')
const assets = ref<Asset[]>([])
const sourceDimensions = ref('')
const sourceTransparency = ref('')
const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512]
const canGenerate = computed(() => !!source.value && !error.value)
const htmlSnippet = computed(() =>
  [
    '<link rel="icon" href="/favicon.ico" sizes="any">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    `<meta name="theme-color" content="${theme.value}">`,
    '<meta name="msapplication-config" content="/browserconfig.xml">',
  ].join('\n')
)
const manifest = computed(() =>
  JSON.stringify(
    {
      name: siteName.value || 'My Website',
      short_name: siteName.value || 'My Website',
      icons: [192, 512].flatMap((size) => [
        { src: `/android-chrome-${size}x${size}.png`, sizes: `${size}x${size}`, type: 'image/png' },
        {
          src: `/icon-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'maskable',
        },
      ]),
      theme_color: theme.value,
      background_color: background.value,
      display: 'standalone',
    },
    null,
    2
  )
)
const previewStyle = computed(() => ({ backgroundColor: background.value }))

function revokeAssets() {
  for (const asset of assets.value) URL.revokeObjectURL(asset.url)
  assets.value = []
}
onBeforeUnmount(() => {
  revokeAssets()
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
})

function acceptFile(file?: File) {
  if (!file) return
  error.value = ''
  generated.value = false
  revokeAssets()
  if (
    !['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type) &&
    !/\.svg$/i.test(file.name)
  ) {
    error.value = 'Choose an SVG, PNG, JPG, or WebP image.'
    return
  }
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth < 32 || img.naturalHeight < 32) {
      URL.revokeObjectURL(url)
      error.value = `Source is ${img.naturalWidth}×${img.naturalHeight}. Use an image at least 32×32 pixels.`
      return
    }
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    source.value = img
    sourceUrl.value = url
    filename.value = file.name
    sourceDimensions.value = `${img.naturalWidth} × ${img.naturalHeight}px`
    try {
      const sample = document.createElement('canvas')
      sample.width = sample.height = 32
      const context = sample.getContext('2d')!
      context.drawImage(img, 0, 0, 32, 32)
      const pixels = context.getImageData(0, 0, 32, 32).data
      sourceTransparency.value = Array.from({ length: 32 * 32 }, (_, i) => pixels[i * 4 + 3]).some(
        (alpha) => alpha < 255
      )
        ? 'Transparency detected'
        : 'No transparency detected'
    } catch {
      sourceTransparency.value = 'Transparency could not be checked for this SVG'
    }
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    error.value = 'This image could not be read. Try a PNG, JPG, or self-contained SVG.'
  }
  img.src = url
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  acceptFile(event.dataTransfer?.files[0])
}

function handleFileChange(event: Event) {
  acceptFile((event.currentTarget as HTMLInputElement).files?.[0])
}

function makePng(size: number, maskable = false): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!source.value) return reject(new Error('Upload an image first.'))
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas is unavailable in this browser.'))
    ctx.fillStyle = background.value
    ctx.fillRect(0, 0, size, size)
    const inset = (size * (maskable ? Math.max(padding.value, 20) : padding.value)) / 100
    const inner = size - inset * 2
    const r = Math.min((size * radius.value) / 100, inner / 2)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(inset, inset, inner, inner, r)
    ctx.clip()
    const image = source.value
    const scale = Math.min(inner / image.naturalWidth, inner / image.naturalHeight)
    const w = image.naturalWidth * scale
    const h = image.naturalHeight * scale
    ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h)
    ctx.restore()
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode PNG.'))),
      'image/png'
    )
  })
}

async function generate() {
  if (!canGenerate.value || busy.value) return
  busy.value = true
  error.value = ''
  revokeAssets()
  try {
    const files = new Map<string, Blob>()
    for (const size of sizes) files.set(`favicon-${size}x${size}.png`, await makePng(size))
    files.set('apple-touch-icon.png', files.get('favicon-180x180.png')!)
    files.set('android-chrome-192x192.png', files.get('favicon-192x192.png')!)
    files.set('android-chrome-512x512.png', files.get('favicon-512x512.png')!)
    files.set('icon-192.png', await makePng(192, true))
    files.set('icon-512.png', await makePng(512, true))
    for (const size of [16, 32, 48])
      files.set(`favicon-${size}.png`, files.get(`favicon-${size}x${size}.png`)!)
    files.set(
      'favicon.ico',
      await makeIco([16, 32, 48].map((size) => files.get(`favicon-${size}x${size}.png`)!))
    )
    files.set('safari-pinned-tab.svg', new Blob([makePinnedSvg()], { type: 'image/svg+xml' }))
    files.set('mstile-150x150.png', await makePng(150))
    files.set('site.webmanifest', new Blob([manifest.value], { type: 'application/manifest+json' }))
    files.set(
      'browserconfig.xml',
      new Blob(
        [
          `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square150x150logo src="/mstile-150x150.png"/><TileColor>${background.value}</TileColor></tile></msapplication></browserconfig>`,
        ],
        { type: 'application/xml' }
      )
    )
    files.set('favicon-snippet.html', new Blob([htmlSnippet.value], { type: 'text/html' }))
    assets.value = [...files].map(([name, blob]) => ({
      name,
      blob,
      url: URL.createObjectURL(blob),
      size: blob.size,
    }))
    generated.value = true
    toast(`${assets.value.length} icon files generated`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not generate icons.'
  } finally {
    busy.value = false
  }
}

async function makeIco(pngs: Blob[]) {
  const data = await Promise.all(pngs.map((blob) => blob.arrayBuffer()))
  const header = new Uint8Array(6 + 16 * data.length)
  const view = new DataView(header.buffer)
  view.setUint16(2, 1, true)
  view.setUint16(4, data.length, true)
  let offset = header.length
  data.forEach((buffer, index) => {
    const p = 6 + index * 16
    header[p] = [16, 32, 48][index] === 256 ? 0 : [16, 32, 48][index]
    header[p + 1] = header[p]
    view.setUint16(p + 4, 1, true)
    view.setUint16(p + 6, 32, true)
    view.setUint32(p + 8, buffer.byteLength, true)
    view.setUint32(p + 12, offset, true)
    offset += buffer.byteLength
  })
  return new Blob([header, ...data], { type: 'image/x-icon' })
}

function makePinnedSvg() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const img = source.value!
  const scale = Math.min(100 / img.naturalWidth, 100 / img.naturalHeight)
  ctx.drawImage(
    img,
    (128 - img.naturalWidth * scale) / 2,
    (128 - img.naturalHeight * scale) / 2,
    img.naturalWidth * scale,
    img.naturalHeight * scale
  )
  const pixels = ctx.getImageData(0, 0, 128, 128)
  for (let i = 0; i < pixels.data.length; i += 4) {
    const luminance =
      (pixels.data[i] * 0.2126 + pixels.data[i + 1] * 0.7152 + pixels.data[i + 2] * 0.0722) / 255
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 255
    pixels.data[i + 3] = Math.round(luminance * pixels.data[i + 3])
  }
  ctx.putImageData(pixels, 0, 0)
  const maskPng = canvas.toDataURL('image/png')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><mask id="icon"><image width="128" height="128" href="${maskPng}"/></mask><rect width="128" height="128" fill="${tint.value}" mask="url(#icon)"/></svg>`
}

async function downloadZip() {
  if (!assets.value.length) return
  downloadBlob(await makeZip(assets.value), 'favicon-package.zip')
}
async function makeZip(items: Asset[]) {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const item of items) {
    const name = encoder.encode(item.name)
    const data = new Uint8Array(await item.blob.arrayBuffer())
    const crc = crc32(data)
    const local = new Uint8Array(30 + name.length + data.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true)
    lv.setUint16(4, 20, true)
    lv.setUint16(6, 0x800, true)
    lv.setUint32(14, crc, true)
    lv.setUint32(18, data.length, true)
    lv.setUint32(22, data.length, true)
    lv.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(data, 30 + name.length)
    locals.push(local)
    const central = new Uint8Array(46 + name.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint16(8, 0x800, true)
    cv.setUint32(16, crc, true)
    cv.setUint32(20, data.length, true)
    cv.setUint32(24, data.length, true)
    cv.setUint16(28, name.length, true)
    cv.setUint32(42, offset, true)
    central.set(name, 46)
    centrals.push(central)
    offset += local.length
  }
  const centralSize = centrals.reduce((sum, item) => sum + item.length, 0)
  const end = new Uint8Array(22)
  const ev = new DataView(end.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, items.length, true)
  ev.setUint16(10, items.length, true)
  ev.setUint32(12, centralSize, true)
  ev.setUint32(16, offset, true)
  return new Blob([...locals, ...centrals, end], { type: 'application/zip' })
}
function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}
function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast(`${label} copied`)
  } catch {
    toast('Clipboard access is unavailable')
  }
}
</script>

<template>
  <ToolLayout>
    <div class="grid gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
      <section class="grid content-start gap-5">
        <div class="grid gap-2">
          <Label>Source image</Label>
          <label
            class="border-border bg-muted/40 grid min-h-36 cursor-pointer place-items-center rounded-md border border-dashed p-5 text-center"
            :class="dragOver && 'border-primary bg-muted'"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
          >
            <input
              class="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp,.svg"
              @change="handleFileChange"
            />
            <div class="grid gap-1"
              ><span class="font-medium">Drop an image or choose a file</span
              ><span class="text-muted-foreground text-sm"
                >SVG, PNG, JPG, WebP · minimum 32 × 32px</span
              ><span v-if="filename" class="text-primary text-sm"
                >{{ filename }} · {{ sourceDimensions }} · {{ sourceTransparency }}</span
              ></div
            >
          </label>
          <p v-if="error" role="alert" class="text-destructive text-sm">{{ error }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2"
            ><Label for="padding">Padding (%)</Label
            ><Input id="padding" v-model.number="padding" type="number" min="0" max="40"
          /></div>
          <div class="grid gap-2"
            ><Label for="radius">Corner radius (%)</Label
            ><Input id="radius" v-model.number="radius" type="number" min="0" max="50"
          /></div>
          <div class="grid gap-2"
            ><Label for="bg">Background</Label
            ><Input id="bg" v-model="background" type="color" class="h-11 p-1"
          /></div>
          <div class="grid gap-2"
            ><Label for="theme">Theme color</Label
            ><Input id="theme" v-model="theme" type="color" class="h-11 p-1"
          /></div>
          <div class="grid gap-2"
            ><Label for="tint">Safari tint</Label
            ><Input id="tint" v-model="tint" type="color" class="h-11 p-1"
          /></div>
          <div class="grid gap-2"
            ><Label for="sitename">Site name</Label
            ><Input id="sitename" v-model="siteName" placeholder="My Website"
          /></div>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button class="h-11 px-5" :disabled="!canGenerate || busy" @click="generate">{{
            busy ? 'Generating…' : 'Generate All'
          }}</Button>
          <Button
            variant="outline"
            class="h-11 px-5"
            :disabled="!assets.length"
            @click="downloadZip"
            >Download ZIP</Button
          >
        </div>
      </section>

      <section
        class="border-border grid content-start gap-5 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="border-border grid gap-2 rounded-md border p-4"
            ><Label>Browser tab · light</Label
            ><div
              class="border-border flex items-center gap-2 rounded-t-md border bg-white px-3 py-2 text-xs text-slate-700"
              ><span
                class="grid size-5 place-items-center overflow-hidden rounded"
                :style="previewStyle"
                ><img
                  v-if="sourceUrl"
                  :src="sourceUrl"
                  class="size-full object-contain"
                  alt="Icon preview" /></span
              >{{ siteName || 'My Website' }}</div
            ></div
          >
          <div class="border-border grid gap-2 rounded-md border p-4"
            ><Label>Browser tab · dark</Label
            ><div
              class="flex items-center gap-2 rounded-t-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              ><span
                class="grid size-5 place-items-center overflow-hidden rounded"
                :style="previewStyle"
                ><img
                  v-if="sourceUrl"
                  :src="sourceUrl"
                  class="size-full object-contain"
                  alt="Icon preview" /></span
              >{{ siteName || 'My Website' }}</div
            ></div
          >
          <div class="border-border grid gap-2 rounded-md border p-4"
            ><Label>iOS home screen</Label
            ><div
              class="grid min-h-28 place-items-center rounded-md bg-gradient-to-br from-sky-200 to-indigo-300"
              ><div class="grid justify-items-center gap-2 text-xs text-slate-900"
                ><span
                  class="grid size-16 place-items-center overflow-hidden shadow"
                  :style="{ ...previewStyle, borderRadius: '22%' }"
                  ><img
                    v-if="sourceUrl"
                    :src="sourceUrl"
                    class="size-full object-contain"
                    alt="iOS icon preview" /></span
                >{{ siteName || 'My Website' }}</div
              ></div
            ></div
          >
          <div class="border-border grid gap-2 rounded-md border p-4"
            ><Label>Maskable safe area</Label
            ><div class="grid min-h-28 place-items-center rounded-md bg-slate-100"
              ><div
                class="relative grid size-20 place-items-center overflow-hidden rounded-full"
                :style="previewStyle"
                ><div
                  class="border-primary absolute inset-[20%] rounded-full border-2 border-dashed"
                  aria-label="Maskable safe area guide"
                ></div
                ><img
                  v-if="sourceUrl"
                  :src="sourceUrl"
                  class="size-full object-contain"
                  alt="Maskable preview" /></div></div
          ></div>
        </div>
        <div v-if="generated" class="grid gap-2"
          ><Label>Generated files · {{ assets.length }}</Label
          ><div
            class="border-border grid max-h-48 gap-1 overflow-auto rounded-md border p-3 sm:grid-cols-2"
            ><a
              v-for="asset in assets"
              :key="asset.name"
              :href="asset.url"
              :download="asset.name"
              class="hover:text-primary flex justify-between gap-3 text-sm"
              ><span class="truncate">{{ asset.name }}</span
              ><span class="text-muted-foreground shrink-0"
                >{{ Math.max(1, Math.round(asset.size / 1024)) }} KB</span
              ></a
            ></div
          ></div
        >
        <div class="grid gap-2"
          ><Label>HTML snippet</Label
          ><Textarea :model-value="htmlSnippet" rows="6" readonly /><Button
            variant="outline"
            class="w-fit"
            @click="copy(htmlSnippet, 'HTML snippet')"
            >Copy HTML</Button
          ></div
        >
        <div class="grid gap-2"
          ><Label>site.webmanifest</Label
          ><Textarea :model-value="manifest" rows="8" readonly /><Button
            variant="outline"
            class="w-fit"
            @click="copy(manifest, 'Manifest')"
            >Copy manifest</Button
          ></div
        >
      </section>
    </div>
    <tool-explanation
      title="Favicon and app icon generator"
      intro="Create common browser, Apple, Android, and progressive web app icon sizes from one source image. The image is processed locally in your browser."
      detail="The ICO file contains 16, 32, and 48 pixel PNG entries. Maskable icon files use extra inset so launchers can crop the outside edge while keeping the central artwork visible. A 32 pixel minimum source size is required."
      use-case="Generate the package, add its files to your site's public directory, then paste the HTML snippet into the document head and keep site.webmanifest at the path used by the link."
    />
  </ToolLayout>
</template>
