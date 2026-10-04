<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

type Unit = 'px' | '%'

const linked = ref(true)
const elliptical = ref(false)
const unit = ref<Unit>('px')
const size = ref(240)

const r = reactive({
  tl: { x: 16, y: 16 },
  tr: { x: 16, y: 16 },
  br: { x: 16, y: 16 },
  bl: { x: 16, y: 16 },
})

watch([() => r.tl.x, () => r.tl.y, linked, elliptical, unit], () => {
  if (!linked.value) return
  if (!elliptical.value) {
    r.tr.x = r.br.x = r.bl.x = r.tl.x
    r.tr.y = r.br.y = r.bl.y = r.tl.x
  } else {
    r.tr.x = r.br.x = r.bl.x = r.tl.x
    r.tr.y = r.br.y = r.bl.y = r.tl.y
  }
})

const cssValue = computed(() => {
  const U = unit.value
  if (!elliptical.value) {
    const a = `${r.tl.x}${U}`
    const b = `${r.tr.x}${U}`
    const c = `${r.br.x}${U}`
    const d = `${r.bl.x}${U}`
    return `${a} ${b} ${c} ${d}`
  } else {
    const hx = `${r.tl.x}${U} ${r.tr.x}${U} ${r.br.x}${U} ${r.bl.x}${U}`
    const vy = `${r.tl.y}${U} ${r.tr.y}${U} ${r.br.y}${U} ${r.bl.y}${U}`
    return `${hx} / ${vy}`
  }
})

const cssText = computed(() => `border-radius: ${cssValue.value};`)

const previewStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
  borderRadius: cssValue.value,
}))

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function setAll(x: number, y?: number) {
  if (!elliptical.value) {
    r.tl.x = r.tr.x = r.br.x = r.bl.x = clamp(x, 0, unit.value === '%' ? 100 : 9999)
    r.tl.y = r.tr.y = r.br.y = r.bl.y = r.tl.x
  } else {
    const X = clamp(x, 0, unit.value === '%' ? 100 : 9999)
    const Y = clamp(y ?? x, 0, unit.value === '%' ? 100 : 9999)
    r.tl.x = r.tr.x = r.br.x = r.bl.x = X
    r.tl.y = r.tr.y = r.br.y = r.bl.y = Y
  }
}

function resetAll() {
  linked.value = true
  elliptical.value = false
  unit.value = 'px'
  size.value = 240
  setAll(16)
}

type Preset = { label: string; apply: () => void }
const presets: Preset[] = [
  {
    label: 'Circle',
    apply: () => {
      unit.value = '%'
      linked.value = true
      elliptical.value = false
      setAll(50)
    },
  },
  {
    label: 'Pill',
    apply: () => {
      unit.value = 'px'
      linked.value = true
      elliptical.value = false
      setAll(9999)
    },
  },
  {
    label: 'Squircle-ish',
    apply: () => {
      unit.value = '%'
      linked.value = false
      elliptical.value = true
      r.tl.x = 35
      r.tl.y = 45
      r.tr.x = 45
      r.tr.y = 35
      r.br.x = 35
      r.br.y = 45
      r.bl.x = 45
      r.bl.y = 35
    },
  },
]

async function copyCss() {
  try {
    await navigator.clipboard.writeText(cssText.value)
    toast('CSS copied')
  } catch {}
}
</script>

<template>
  <ToolLayout>
    <div class="grid gap-6 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
      <div class="grid content-start gap-6">
        <div class="grid gap-2">
          <Label>Unit</Label>
          <Select v-model="unit">
            <SelectTrigger class="w-40"><SelectValue placeholder="px" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label>Link corners</Label>
          <div class="flex gap-2">
            <Button
              :variant="linked ? 'default' : 'outline'"
              class="h-11 px-5"
              @click="linked = true"
              >Linked</Button
            >
            <Button
              :variant="!linked ? 'default' : 'outline'"
              class="h-11 px-5"
              @click="linked = false"
              >Independent</Button
            >
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Mode</Label>
          <div class="flex gap-2">
            <Button
              :variant="!elliptical ? 'default' : 'outline'"
              class="h-11 px-5"
              @click="elliptical = false"
              >Circular</Button
            >
            <Button
              :variant="elliptical ? 'default' : 'outline'"
              class="h-11 px-5"
              @click="elliptical = true"
              >Elliptical</Button
            >
          </div>
        </div>

        <Separator class="bg-muted" />

        <div class="grid gap-5">
          <div class="grid gap-2">
            <Label>Top-left</Label>
            <div class="flex items-center gap-3">
              <Slider
                v-model.number="r.tl.x"
                :min="0"
                :max="unit === '%' ? 100 : 9999"
                step="1"
                aria-label="Top-left horizontal radius"
              />
              <Input v-model.number="r.tl.x" type="number" class="h-11 w-24" />
              <template v-if="elliptical">
                <span class="text-muted-foreground">/</span>
                <Slider
                  v-model.number="r.tl.y"
                  :min="0"
                  :max="unit === '%' ? 100 : 9999"
                  step="1"
                  aria-label="Top-left vertical radius"
                />
                <Input v-model.number="r.tl.y" type="number" class="h-11 w-24" />
              </template>
            </div>
          </div>

          <div class="grid gap-2">
            <Label>Top-right</Label>
            <div class="flex items-center gap-3">
              <Slider
                v-model.number="r.tr.x"
                :min="0"
                :max="unit === '%' ? 100 : 9999"
                step="1"
                aria-label="Top-right horizontal radius"
              />
              <Input v-model.number="r.tr.x" type="number" class="h-11 w-24" />
              <template v-if="elliptical">
                <span class="text-muted-foreground">/</span>
                <Slider
                  v-model.number="r.tr.y"
                  :min="0"
                  :max="unit === '%' ? 100 : 9999"
                  step="1"
                  aria-label="Top-right vertical radius"
                />
                <Input v-model.number="r.tr.y" type="number" class="h-11 w-24" />
              </template>
            </div>
          </div>

          <div class="grid gap-2">
            <Label>Bottom-right</Label>
            <div class="flex items-center gap-3">
              <Slider
                v-model.number="r.br.x"
                :min="0"
                :max="unit === '%' ? 100 : 9999"
                step="1"
                aria-label="Bottom-right horizontal radius"
              />
              <Input v-model.number="r.br.x" type="number" class="h-11 w-24" />
              <template v-if="elliptical">
                <span class="text-muted-foreground">/</span>
                <Slider
                  v-model.number="r.br.y"
                  :min="0"
                  :max="unit === '%' ? 100 : 9999"
                  step="1"
                  aria-label="Bottom-right vertical radius"
                />
                <Input v-model.number="r.br.y" type="number" class="h-11 w-24" />
              </template>
            </div>
          </div>

          <div class="grid gap-2">
            <Label>Bottom-left</Label>
            <div class="flex items-center gap-3">
              <Slider
                v-model.number="r.bl.x"
                :min="0"
                :max="unit === '%' ? 100 : 9999"
                step="1"
                aria-label="Bottom-left horizontal radius"
              />
              <Input v-model.number="r.bl.x" type="number" class="h-11 w-24" />
              <template v-if="elliptical">
                <span class="text-muted-foreground">/</span>
                <Slider
                  v-model.number="r.bl.y"
                  :min="0"
                  :max="unit === '%' ? 100 : 9999"
                  step="1"
                  aria-label="Bottom-left vertical radius"
                />
                <Input v-model.number="r.bl.y" type="number" class="h-11 w-24" />
              </template>
            </div>
          </div>
        </div>

        <Separator class="bg-muted" />

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
            <Button variant="ghost" class="h-9 px-3" @click="resetAll">Reset</Button>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="sz">Preview size</Label>
          <div class="flex items-center gap-3">
            <Slider v-model.number="size" min="120" max="420" step="1" aria-label="sz" />
            <Input v-model.number="size" type="number" class="h-11 w-24" />
          </div>
        </div>
      </div>

      <div
        class="border-border grid content-start gap-6 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
      >
        <div class="flex items-center justify-center">
          <div class="border-border bg-muted border shadow-sm" :style="previewStyle" />
        </div>

        <div class="grid gap-2">
          <Label>Generated CSS</Label>
          <Textarea :value="cssText" rows="3" readonly />
          <div class="flex gap-2">
            <Button class="h-11 px-5" @click="copyCss">Copy CSS</Button>
            <Button variant="outline" class="h-11 px-5" @click="setAll(0)">All 0</Button>
            <Button variant="outline" class="h-11 px-5" @click="setAll(unit === '%' ? 50 : 16)"
              >Baseline</Button
            >
          </div>
        </div>
      </div>
    </div>
    <tool-explanation
      title="CSS border-radius generator"
      intro="The CSS border-radius property rounds the corners of an element. It accepts one to four values for individual corners and can use pixels or percentages."
      detail="Linking corners keeps a consistent shape, while elliptical mode lets horizontal and vertical radii differ. Presets provide common shapes such as circles and pills, and the preview shows the generated declaration."
      use-case="Use the controls to create rounded buttons, cards, avatars and other interface shapes, then copy the CSS."
    />
  </ToolLayout>
</template>
