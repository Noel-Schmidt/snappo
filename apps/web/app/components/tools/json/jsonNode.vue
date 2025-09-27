<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'JsonNode' })

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue }

const props = defineProps<{
  k?: string | number
  v: JsonValue
  path?: string
  rootOpen?: boolean
}>()

const emit = defineEmits<{ (e: 'copy'): void }>()

function typeOf(v: JsonValue): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  const t = typeof v
  if (t === 'string' || t === 'number' || t === 'boolean') return t
  return 'object'
}
function displayValue(v: JsonValue): string {
  const t = typeOf(v)
  if (t === 'string') return JSON.stringify(v as string)
  if (t === 'null') return 'null'
  return String(v as any)
}
const t = computed(() => typeOf(props.v))
const isBranch = computed(() => t.value === 'object' || t.value === 'array')
const size = computed(() =>
  t.value === 'array'
    ? (props.v as JsonValue[]).length
    : Object.keys((props.v as Record<string, JsonValue>) || {}).length
)
const open = ref<boolean>(props.rootOpen ?? true)

function childPath(childKey: string | number) {
  return props.path ? `${props.path}.${String(childKey)}` : String(childKey)
}
async function copyVal() {
  try {
    await navigator.clipboard.writeText(displayValue(props.v))
    emit('copy')
  } catch {}
}
async function copyPath() {
  const p = props.path ?? (props.k !== undefined ? String(props.k) : '')
  if (!p) return
  try {
    await navigator.clipboard.writeText(p)
    emit('copy')
  } catch {}
}
</script>

<template>
  <div class="pl-3">
    <div class="flex items-center gap-2">
      <button
        v-if="isBranch"
        class="rounded border border-neutral-700 bg-neutral-800 px-1 py-0.5 text-xs"
        @click="open = !open"
      >
        {{ open ? '−' : '+' }}
      </button>
      <span v-else class="w-4" />
      <span v-if="k !== undefined" class="text-neutral-400">{{ String(k) }}:</span>
      <span v-else class="text-neutral-400">{{ t }}</span>

      <span v-if="isBranch" class="text-neutral-300">
        {{ t === 'array' ? `Array(${size})` : `Object(${size})` }}
      </span>
      <code
        v-else
        class="break-all font-mono text-sm"
        :class="{
          'text-emerald-300': t === 'string',
          'text-amber-300': t === 'number',
          'text-sky-300': t === 'boolean',
          'text-neutral-300': t === 'null',
        }"
        >{{ displayValue(v) }}</code
      >

      <div class="ml-auto flex gap-1">
        <button
          class="rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] hover:bg-neutral-800"
          @click="copyVal"
          >copy</button
        >
        <button
          v-if="k !== undefined || path"
          class="rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] hover:bg-neutral-800"
          @click="copyPath"
          >path</button
        >
      </div>
    </div>

    <div v-if="isBranch && open" class="mt-1 border-l border-neutral-800">
      <template v-if="t === 'array'">
        <JsonNode
          v-for="(cv, idx) in v as JsonValue[]"
          :key="idx"
          :k="idx"
          :v="cv"
          :path="childPath(idx)"
          @copy="$emit('copy')"
        />
      </template>
      <template v-else>
        <JsonNode
          v-for="ck in Object.keys(v as Record<string, JsonValue>)"
          :key="ck"
          :k="ck"
          :v="(v as Record<string, JsonValue>)[ck]"
          :path="childPath(ck)"
          @copy="$emit('copy')"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
code {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
