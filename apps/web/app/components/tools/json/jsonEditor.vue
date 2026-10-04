<script setup lang="ts">
import { computed, ref } from 'vue'

type TokenKind = 'key' | 'string' | 'number' | 'literal' | 'punctuation' | 'comment' | 'invalid'
type Token = { text: string; kind?: TokenKind }

const props = defineProps<{
  modelValue: string
  indent: '2' | '4' | 'tab'
  jsonc: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'blur', value: FocusEvent): void
  (event: 'paste', value: ClipboardEvent): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const highlightLayer = ref<HTMLPreElement | null>(null)
const indentUnit = computed(() =>
  props.indent === 'tab' ? '\t' : ' '.repeat(Number(props.indent))
)

const tokens = computed<Token[]>(() => {
  const source = props.modelValue
  const result: Token[] = []
  let index = 0

  while (index < source.length) {
    const start = index
    const char = source[index]

    if (/\s/.test(char)) {
      while (index < source.length && /\s/.test(source[index])) index++
      result.push({ text: source.slice(start, index) })
      continue
    }

    if (props.jsonc && char === '/' && source[index + 1] === '/') {
      while (index < source.length && source[index] !== '\n') index++
      result.push({ text: source.slice(start, index), kind: 'comment' })
      continue
    }

    if (props.jsonc && char === '/' && source[index + 1] === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index++
      index = Math.min(source.length, index + 2)
      result.push({ text: source.slice(start, index), kind: 'comment' })
      continue
    }

    if (char === '"') {
      index++
      let closed = false
      while (index < source.length) {
        if (source[index] === '\\') index += 2
        else if (source[index++] === '"') {
          closed = true
          break
        }
      }
      const text = source.slice(start, Math.min(index, source.length))
      let next = index
      while (/\s/.test(source[next] ?? '') && next < source.length) next++
      const isKey = source[next] === ':'
      result.push({ text, kind: closed ? (isKey ? 'key' : 'string') : 'invalid' })
      continue
    }

    if ('{}[]:,'.includes(char)) {
      result.push({ text: char, kind: 'punctuation' })
      index++
      continue
    }

    const number = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(index))
    if (number) {
      result.push({ text: number[0], kind: 'number' })
      index += number[0].length
      continue
    }

    const literal = /^(?:true|false|null)\b/.exec(source.slice(index))
    if (literal) {
      result.push({ text: literal[0], kind: 'literal' })
      index += literal[0].length
      continue
    }

    while (index < source.length && !/[\s{}\[\]:,\"]/.test(source[index])) index++
    result.push({ text: source.slice(start, Math.max(index, start + 1)), kind: 'invalid' })
    if (index === start) index++
  }

  return result
})

function updateValue(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function syncScroll(): void {
  if (!textarea.value || !highlightLayer.value) return
  highlightLayer.value.scrollTop = textarea.value.scrollTop
  highlightLayer.value.scrollLeft = textarea.value.scrollLeft
}

function handleKeydown(event: KeyboardEvent): void {
  if (!textarea.value) return

  const editor = textarea.value
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const before = props.modelValue.slice(0, start)
  const after = props.modelValue.slice(end)
  const linePrefix = before.slice(before.lastIndexOf('\n') + 1)
  const currentIndent = /^(\s*)/.exec(linePrefix)?.[1] ?? ''

  if (event.key === 'Tab') {
    event.preventDefault()
    if (event.shiftKey && !linePrefix.trim() && currentIndent) {
      const outdent = currentIndent.slice(
        0,
        Math.max(0, currentIndent.length - indentUnit.value.length)
      )
      editor.setRangeText(outdent, start - currentIndent.length, end, 'end')
      const caret = start - currentIndent.length + outdent.length
      editor.setSelectionRange(caret, caret)
    } else {
      editor.setRangeText(indentUnit.value, start, end, 'end')
    }
    emit('update:modelValue', editor.value)
    syncScroll()
    return
  }

  if ((event.key === '}' || event.key === ']') && !linePrefix.trim() && currentIndent) {
    const outdent = currentIndent.slice(
      0,
      Math.max(0, currentIndent.length - indentUnit.value.length)
    )
    event.preventDefault()
    editor.setRangeText(`${outdent}${event.key}`, start - currentIndent.length, end, 'end')
    const caret = start - currentIndent.length + outdent.length + 1
    editor.setSelectionRange(caret, caret)
    emit('update:modelValue', editor.value)
    syncScroll()
    return
  }

  if (event.key !== 'Enter') return
  const previous = linePrefix.trimEnd().slice(-1)
  const next = after.trimStart()[0]
  let insertion = `\n${currentIndent}`
  let cursorOffset = insertion.length

  if (previous === '{' || previous === '[') {
    const innerIndent = currentIndent + indentUnit.value
    if (next === '}' || next === ']') {
      insertion = `\n${innerIndent}\n${currentIndent}`
      cursorOffset = 1 + innerIndent.length
    } else {
      insertion = `\n${innerIndent}`
      cursorOffset = insertion.length
    }
  }

  event.preventDefault()
  editor.setRangeText(insertion, start, end, 'end')
  editor.setSelectionRange(start + cursorOffset, start + cursorOffset)
  emit('update:modelValue', editor.value)
  syncScroll()
}
</script>

<template>
  <div class="relative min-h-[400px] flex-1 overflow-hidden">
    <pre
      ref="highlightLayer"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words px-5 py-3 font-mono text-[13px] leading-6 sm:px-6"
    ><code><span
        v-for="(token, index) in tokens"
        :key="index"
        :class="{
          'text-sky-700 dark:text-sky-300': token.kind === 'key',
          'text-emerald-700 dark:text-emerald-300': token.kind === 'string',
          'text-amber-700 dark:text-amber-300': token.kind === 'number',
          'text-violet-700 dark:text-violet-300': token.kind === 'literal',
          'text-muted-foreground': token.kind === 'punctuation' || token.kind === 'comment',
          'text-destructive underline decoration-wavy': token.kind === 'invalid',
          'italic': token.kind === 'comment',
        }"
        >{{ token.text }}</span
      ></code></pre>
    <textarea
      ref="textarea"
      id="json-input"
      :value="modelValue"
      class="border-input focus-visible:border-ring focus-visible:ring-ring/50 selection:bg-primary/20 caret-foreground placeholder:text-muted-foreground absolute inset-0 h-full min-h-full w-full resize-none break-words rounded-none border-0 bg-transparent px-5 py-3 font-mono text-[13px] leading-6 text-transparent selection:text-transparent placeholder:opacity-100 focus-visible:outline-none focus-visible:ring-2 sm:px-6"
      placeholder="Paste or type JSON here…"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      aria-describedby="input-help"
      @input="updateValue"
      @keydown="handleKeydown"
      @scroll="syncScroll"
      @blur="$emit('blur', $event)"
      @paste="$emit('paste', $event)"
    />
  </div>
</template>
