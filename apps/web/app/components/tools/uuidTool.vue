<script setup lang="ts">
import { ref, computed } from 'vue'
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

type UuidVersion = 'v1' | 'v4' | 'v5'
type NamespacePreset = 'dns' | 'url' | 'oid' | 'x500' | 'custom'

const version = ref<UuidVersion>('v4')
const count = ref<number>(10)

const nsPreset = ref<NamespacePreset>('dns')
const nsCustom = ref<string>('')
const v5name = ref<string>('example.com')

const uuids = ref<string[]>([])

const NS_PRESETS: Record<Exclude<NamespacePreset, 'custom'>, string> = {
  dns: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  url: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  oid: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
}

function bytesToUuid(b: Uint8Array): string {
  const hex: string[] = Array.from(b, (v) => v.toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join('') + hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 12).join(''),
    hex.slice(12).join(''),
  ].join('-')
}

function uuidToBytes(u: string): Uint8Array {
  const m = u
    .trim()
    .toLowerCase()
    .match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  if (!m) throw new Error('Invalid namespace UUID')
  const h = u.replace(/-/g, '')
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16)
  return out
}

function setVariantRFC4122(b: Uint8Array): void {
  b[8] = (b[8] & 0x3f) | 0x80
}
function setVersion(b: Uint8Array, v: 1 | 4 | 5): void {
  b[6] = (b[6] & 0x0f) | (v << 4)
}

function uuidv4(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  setVariantRFC4122(b)
  setVersion(b, 4)
  return bytesToUuid(b)
}

async function uuidv5(namespaceUuid: string, name: string): Promise<string> {
  const ns = uuidToBytes(namespaceUuid)
  const nameBytes = new TextEncoder().encode(name)
  const data = new Uint8Array(ns.length + nameBytes.length)
  data.set(ns, 0)
  data.set(nameBytes, ns.length)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', data))
  const b = hash.slice(0, 16)
  setVariantRFC4122(b)
  setVersion(b, 5)
  return bytesToUuid(b)
}

const GREGORIAN_OFFSET_MS = 12219292800000
let _lastMs = 0
let _nsecs = 0
let _clockseq = (() => (
  crypto.getRandomValues(new Uint8Array(2)),
  Math.floor(Math.random() * 0x4000)
))()
let _nodeId = (() => {
  const n = new Uint8Array(6)
  crypto.getRandomValues(n)
  n[0] |= 0x01
  return n
})()

function uuidv1(): string {
  let nowMs = Date.now()
  if (nowMs === _lastMs) {
    _nsecs++
    if (_nsecs >= 10000) {
      _nsecs = 0
      nowMs++
    }
  } else {
    _nsecs = 0
  }
  _lastMs = nowMs

  const t = BigInt(nowMs + GREGORIAN_OFFSET_MS) * 10000n + BigInt(_nsecs)
  const timeLow = Number(t & 0xffffffffn) >>> 0
  const timeMid = Number((t >> 32n) & 0xffffn) >>> 0
  const timeHi = Number((t >> 48n) & 0x0fffn) >>> 0

  const b = new Uint8Array(16)
  b[0] = (timeLow >>> 24) & 0xff
  b[1] = (timeLow >>> 16) & 0xff
  b[2] = (timeLow >>> 8) & 0xff
  b[3] = timeLow & 0xff
  b[4] = (timeMid >>> 8) & 0xff
  b[5] = timeMid & 0xff
  b[6] = ((timeHi >>> 8) & 0x0f) | 0x10
  b[7] = timeHi & 0xff
  const cs = _clockseq & 0x3fff
  b[8] = ((cs >>> 8) & 0x3f) | 0x80
  b[9] = cs & 0xff
  b.set(_nodeId, 10)
  return bytesToUuid(b)
}

const needsV5 = computed(() => version.value === 'v5')
const activeNamespace = computed(() =>
  nsPreset.value === 'custom' ? nsCustom.value.trim() : NS_PRESETS[nsPreset.value]
)

async function onGenerate() {
  const c = Math.max(1, Math.min(500, Number(count.value) || 1))
  const out: string[] = []
  try {
    if (version.value === 'v4') {
      for (let i = 0; i < c; i++) out.push(uuidv4())
    } else if (version.value === 'v1') {
      for (let i = 0; i < c; i++) out.push(uuidv1())
    } else {
      const ns = activeNamespace.value
      if (!ns) throw new Error('Namespace is required for v5')
      uuidToBytes(ns)
      for (let i = 0; i < c; i++) out.push(await uuidv5(ns, v5name.value))
    }
    uuids.value = out
  } catch (e: any) {
    uuids.value = []
    toast('Error', { description: String(e?.message || e) })
  }
}

async function copyAll() {
  if (!uuids.value.length) return
  try {
    await navigator.clipboard.writeText(uuids.value.join('\n'))
    toast('Copied all UUIDs')
  } catch {}
}
async function copyOne(u: string) {
  try {
    await navigator.clipboard.writeText(u)
    toast('Copied')
  } catch {}
}
</script>

<template>
  <ToolLayout>
    <div class="space-y-6">
      <div class="grid lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
        <div class="grid content-start gap-5">
          <div class="flex flex-col space-y-4">
            <div class="grid gap-2">
              <Label for="ver">Version</Label>
              <Select v-model="version">
                <SelectTrigger id="ver"><SelectValue placeholder="Select version" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="v4">UUID v4 (random)</SelectItem>
                  <SelectItem value="v1">UUID v1 (time-based)</SelectItem>
                  <SelectItem value="v5">UUID v5 (namespace)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <Label for="cnt">Count</Label>
              <Input id="cnt" v-model.number="count" type="number" min="1" max="500" class="h-11" />
            </div>

            <div v-if="needsV5" class="border-border grid gap-4 border-t pt-4">
              <div class="grid gap-2">
                <Label>Namespace</Label>
                <Select v-model="nsPreset">
                  <SelectTrigger><SelectValue placeholder="Namespace" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dns">DNS (6ba7b810-…)</SelectItem>
                    <SelectItem value="url">URL (6ba7b811-…)</SelectItem>
                    <SelectItem value="oid">OID (6ba7b812-…)</SelectItem>
                    <SelectItem value="x500">X.500 (6ba7b814-…)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div v-if="nsPreset === 'custom'" class="grid gap-2">
                <Label for="ns">Custom namespace UUID</Label>
                <Input
                  id="ns"
                  v-model="nsCustom"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  class="h-11"
                />
              </div>
              <div class="grid gap-2">
                <Label for="name">Name</Label>
                <Input id="name" v-model="v5name" placeholder="example.com" class="h-11" />
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <Button @click="onGenerate" class="h-11 px-5">Generate</Button>
              <Button
                variant="outline"
                :disabled="uuids.length === 0"
                @click="copyAll"
                class="h-11 px-5"
                >Copy all</Button
              >
            </div>
          </div>
        </div>

        <div
          class="border-border grid content-start gap-4 border-t pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
        >
          <div class="grid gap-3">
            <div class="flex items-center justify-between">
              <Label>Results</Label>
              <span class="text-muted-foreground text-xs">{{ uuids.length }} UUID(s)</span>
            </div>
            <Separator class="bg-muted my-3" />
            <div v-if="uuids.length" class="divide-border divide-y">
              <div v-for="u in uuids" :key="u" class="flex items-center justify-between gap-3 py-2">
                <code class="text-foreground break-all font-mono text-sm">{{ u }}</code>
                <Button size="sm" variant="outline" @click="copyOne(u)" class="h-9 px-3"
                  >Copy</Button
                >
              </div>
            </div>
            <p v-else class="text-muted-foreground text-sm"
              >No UUIDs yet. Choose options and generate.</p
            >
          </div>
          <p class="text-muted-foreground mt-3 text-xs">
            Conforms to RFC 4122. v1 uses a random node identifier with multicast bit set and a
            random 14-bit clock sequence.
          </p>
        </div>
      </div>
    </div>
    <tool-explanation
      title="UUID generator"
      intro="A UUID is a 128-bit identifier commonly used to distinguish records or resources. Different UUID versions derive values from random data, time-related data or a namespace and name."
      detail="Choose a version and quantity to generate identifiers. Version 5 uses a namespace and name, so repeating the same inputs produces the same UUID; other versions follow their own generation methods."
      use-case="Create identifiers for development fixtures, test data and systems that need unique IDs."
    />
  </ToolLayout>
</template>
