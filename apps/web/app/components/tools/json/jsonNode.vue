<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({ name: 'JsonNode' })

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const props = defineProps<{
  k?: string | number
  v: JsonValue
  path?: string
  rootOpen?: boolean
}>()

const emit = defineEmits<{ (e: 'copy'): void }>()

const kind = computed(() => {
  if (props.v === null) return 'null'
  if (Array.isArray(props.v)) return 'array'
  return typeof props.v === 'object' ? 'object' : typeof props.v
})
const isBranch = computed(() => kind.value === 'object' || kind.value === 'array')
const entries = computed(() =>
  kind.value === 'array'
    ? (props.v as JsonValue[]).map((value, index) => [index, value] as const)
    : kind.value === 'object'
      ? Object.entries(props.v as Record<string, JsonValue>)
      : []
)
const open = ref(props.rootOpen ?? true)
const preview = computed(() =>
  kind.value === 'array' ? `[${entries.value.length}]` : `{${entries.value.length}}`
)

function childPath(key: string | number): string {
  if (typeof key === 'number') return `${props.path ?? '$'}[${key}]`
  const path = props.path ?? '$'
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`
}

async function copyValue(): Promise<void> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.v))
    emit('copy')
  } catch {
    // Clipboard access may be unavailable outside a secure browser context.
  }
}

async function copyPath(): Promise<void> {
  const value = props.path ?? (props.k !== undefined ? childPath(props.k) : '$')
  try {
    await navigator.clipboard.writeText(value)
    emit('copy')
  } catch {
    // Clipboard access may be unavailable outside a secure browser context.
  }
}
</script>

<template>
  <div class="min-w-0">
    <div
      class="hover:bg-muted/70 focus-within:bg-muted/70 group flex min-h-9 min-w-0 items-center gap-2 rounded-md px-2"
    >
      <button
        v-if="isBranch"
        type="button"
        class="border-border bg-background text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-5 shrink-0 items-center justify-center rounded border font-mono text-xs focus-visible:outline-none focus-visible:ring-2"
        :aria-label="`${open ? 'Collapse' : 'Expand'} ${k ?? 'root'}`"
        :aria-expanded="open"
        @click="open = !open"
      >
        {{ open ? '−' : '+' }}
      </button>
      <span v-else class="size-5 shrink-0" aria-hidden="true" />

      <span v-if="k !== undefined" class="text-foreground shrink-0">{{ String(k) }}</span>
      <span v-else class="text-muted-foreground shrink-0">root</span>
      <span class="text-muted-foreground shrink-0">:</span>

      <span v-if="isBranch" class="text-muted-foreground min-w-0 truncate">
        {{ kind }} <span class="font-mono">{{ preview }}</span>
      </span>
      <code
        v-else
        class="min-w-0 break-all font-mono"
        :class="{
          'text-emerald-700 dark:text-emerald-300': kind === 'string',
          'text-amber-700 dark:text-amber-300': kind === 'number',
          'text-sky-700 dark:text-sky-300': kind === 'boolean',
          'text-muted-foreground': kind === 'null',
        }"
        >{{ JSON.stringify(v) }}</code
      >

      <div
        class="ml-auto flex shrink-0 gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-1 text-xs focus-visible:outline-none focus-visible:ring-2"
          :aria-label="`Copy ${k ?? 'root'} value`"
          @click="copyValue"
        >
          Copy
        </button>
        <button
          v-if="k !== undefined || path"
          type="button"
          class="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded px-1 text-xs focus-visible:outline-none focus-visible:ring-2"
          :aria-label="`Copy ${k ?? ''} path`"
          @click="copyPath"
        >
          Path
        </button>
      </div>
    </div>

    <div v-if="isBranch && open" class="border-border ml-[18px] border-l pl-3">
      <template v-if="entries.length">
        <JsonNode
          v-for="entry in entries"
          :key="childPath(entry[0])"
          :k="entry[0]"
          :v="entry[1]"
          :path="childPath(entry[0])"
          @copy="$emit('copy')"
        />
      </template>
      <p v-else class="text-muted-foreground px-2 py-1 text-xs"> Empty {{ kind }} </p>
    </div>
  </div>
</template>
