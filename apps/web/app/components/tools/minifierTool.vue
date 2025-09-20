<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'

import type { Lang, Action } from '@/components/tools/minifier/formatter.worker'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

const lang = ref<Lang>('auto')
const action = ref<Action>('normalize')
const input = ref<string>('')
const output = ref<string>('')
const running = ref(false)

let worker: Worker | null = null

function initWorker(): void {
  worker = new Worker(new URL('@/components/tools/minifier/formatter.worker.ts', import.meta.url), {
    type: 'module',
  })
  worker.onmessage = (e: MessageEvent<{ ok: boolean; data?: string; error?: string }>) => {
    running.value = false
    const msg = e.data
    if (msg.ok) output.value = msg.data || ''
    else {
      output.value = ''
      toast('Error', { description: msg.error || 'Formatting failed' })
    }
  }
}
function killWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
  }
}

const canRun = computed(() => !running.value && input.value.trim().length > 0)

function run(): void {
  if (!worker) initWorker()
  if (!worker) return
  running.value = true
  worker.postMessage({ src: input.value, lang: lang.value, action: action.value })
}

async function copyOut(): Promise<void> {
  try {
    await navigator.clipboard.writeText(output.value)
    toast('Copied output')
  } catch {}
}
function clearAll(): void {
  input.value = ''
  output.value = ''
}

onMounted(initWorker)
onBeforeUnmount(killWorker)
</script>

<template>
  <section class="bg-neutral-950 py-24 text-neutral-50">
    <div class="mx-auto max-w-6xl px-6">
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div class="grid gap-6 md:grid-cols-12">
          <div class="grid gap-4 self-start md:sticky md:top-4 md:col-span-3">
            <div class="grid gap-2">
              <Label for="lang">Language</Label>
              <Select v-model="lang">
                <SelectTrigger id="lang">
                  <SelectValue placeholder="auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">auto</SelectItem>
                  <SelectItem value="generic">generic (any text)</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="mixed">mixed (HTML + JS/CSS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <Label for="action">Action</Label>
              <Select v-model="action">
                <SelectTrigger id="action">
                  <SelectValue placeholder="normalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normalize">Normalize</SelectItem>
                  <SelectItem value="minify">Minify</SelectItem>
                  <SelectItem value="prettify">Prettify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="flex gap-2 pt-2">
              <Button :disabled="!canRun" @click="run">
                <span v-if="running">Processing…</span>
                <span v-else>Run</span>
              </Button>
              <Button variant="outline" :disabled="!output" @click="copyOut">Copy output</Button>
              <Button variant="ghost" @click="clearAll">Clear</Button>
            </div>
          </div>

          <div class="grid gap-4 md:col-span-9">
            <div class="grid gap-2">
              <Label for="src">Input</Label>
              <Textarea
                id="src"
                v-model="input"
                class="h-[360px] resize-none overflow-auto font-mono text-sm leading-6"
                spellcheck="false"
              />
              <p class="text-xs text-neutral-500">
                Large inputs run in a Web Worker. Use “mixed” for HTML with
                &lt;script&gt;/&lt;style&gt;.
              </p>
            </div>

            <Separator class="bg-neutral-800" />

            <div class="grid gap-2">
              <Label for="out">Output</Label>
              <Textarea
                id="out"
                v-model="output"
                class="h-[360px] resize-none overflow-auto font-mono text-sm leading-6"
                spellcheck="false"
                readonly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
textarea {
  word-break: break-word;
  white-space: pre;
}
</style>
