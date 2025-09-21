export type Lang = 'auto' | 'generic' | 'json' | 'javascript' | 'css' | 'html' | 'mixed'
export type Action = 'minify' | 'prettify' | 'normalize'

type MsgIn = { src: string; lang: Lang; action: Action }
type MsgOut = { ok: true; data: string } | { ok: false; error: string }

self.onmessage = (ev: MessageEvent<MsgIn>) => {
  const { src, lang, action } = ev.data
  try {
    const picked = lang === 'auto' ? detectLanguage(src) : lang
    let out = ''
    if (picked === 'generic' || action === 'normalize') out = normalizeGeneric(src)
    else if (picked === 'json') out = action === 'minify' ? minJson(src) : prettyJson(src)
    else if (picked === 'javascript') out = action === 'minify' ? minJs(src) : prettyJs(src)
    else if (picked === 'css') out = action === 'minify' ? minCss(src) : prettyCss(src)
    else if (picked === 'html') out = action === 'minify' ? minHtml(src) : prettyHtml(src)
    else out = action === 'minify' ? minMixed(src) : prettyMixed(src)

    postMessage({ ok: true, data: out } as MsgOut)
  } catch (e: any) {
    postMessage({ ok: false, error: String(e?.message || e) } as MsgOut)
  }
}

function detectLanguage(s: string): Lang {
  const t = s.trim()
  if (!t) return 'generic'
  const hasHtmlTag = /<([a-z][\w:-]*)(\s[^>]*)?>/i.test(t)
  const hasScript = /<script\b/i.test(t) || /<\/script>/i.test(t)
  const hasStyle = /<style\b/i.test(t) || /<\/style>/i.test(t)
  if (hasHtmlTag && (hasScript || hasStyle)) return 'mixed'
  if (hasHtmlTag) return 'html'
  if (t.startsWith('{') || t.startsWith('[')) {
    try {
      JSON.parse(t)
      return 'json'
    } catch {}
  }
  if (/\{[^}]*:[^}]*;/.test(t) && !/function|=>/.test(t)) return 'css'
  return 'javascript'
}

function normalizeGeneric(s: string): string {
  return (
    s
      .replace(/[\t ]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

function minJson(s: string): string {
  return JSON.stringify(JSON.parse(s))
}

function prettyJson(s: string): string {
  return JSON.stringify(JSON.parse(s), null, 2) + '\n'
}

function stripJsComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/(?!\/).*$|^\s*\/\/.*$/gm, '$1')
}

function minJs(s: string): string {
  s = stripJsComments(s)
  s = s.replace(/\s+/g, ' ')
  s = s.replace(/\s*([{}();,:+\-*/%=<>!?&|[\]])\s*/g, '$1')
  s = s.replace(/;}/g, '}')
  return s.trim()
}

function prettyJs(s: string): string {
  s = stripJsComments(s)
  s = s
    .replace(/([{};])/g, '$1\n')
    .replace(/,\s*/g, ', ')
    .replace(/\n{2,}/g, '\n')
  const lines = s.split('\n')
  let depth = 0
  const out: string[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      out.push('')
      continue
    }
    if (/^}/.test(line)) depth = Math.max(0, depth - 1)
    out.push('  '.repeat(depth) + line)
    if (/{\s*$/.test(line)) depth++
  }
  return out.join('\n').trim() + '\n'
}

function stripCssComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '')
}

function minCss(s: string): string {
  s = stripCssComments(s)
  s = s.replace(/\s+/g, ' ')
  s = s.replace(/\s*([{}:;,\(\)])\s*/g, '$1')
  s = s.replace(/;}/g, '}')
  return s.trim()
}

function prettyCss(s: string): string {
  s = stripCssComments(s)
  s = s
    .replace(/}/g, '}\n')
    .replace(/{/g, ' {\n')
    .replace(/;\s*/g, ';\n')
    .replace(/\n{2,}/g, '\n')
  const lines = s.split('\n')
  let depth = 0
  const out: string[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      out.push('')
      continue
    }
    if (line.startsWith('}')) depth = Math.max(0, depth - 1)
    out.push('  '.repeat(depth) + line)
    if (line.endsWith('{')) depth++
  }
  return out.join('\n').trim() + '\n'
}

function minHtml(s: string): string {
  s = protectBlocks(s, (inner, tag) => inner)
  s = s.replace(/<!--[\s\S]*?-->/g, '')
  s = s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ')
  return s.trim()
}

function prettyHtml(s: string): string {
  const voids = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ])
  s = s.replace(/<!--[\s\S]*?-->/g, '')
  const tokens = s
    .replace(/>\s+</g, '><')
    .split(/(<[^>]+>)/g)
    .filter(Boolean)
  let depth = 0
  const out: string[] = []
  for (const t of tokens) {
    if (!t.startsWith('<')) {
      const txt = t.trim()
      if (txt) out.push('  '.repeat(depth) + txt)
      continue
    }
    const isClose = /^<\/\w/.test(t)
    const tagMatch = /^<\/?([a-zA-Z0-9:-]+)/.exec(t)
    const tag = tagMatch ? tagMatch[1].toLowerCase() : ''
    const self = /\/>$/.test(t) || voids.has(tag)
    if (isClose) depth = Math.max(0, depth - 1)
    out.push('  '.repeat(depth) + t)
    if (!isClose && !self) depth++
  }
  return (
    out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

function prettyMixed(s: string): string {
  return transformBlocks(s, { script: prettyJs, style: prettyCss }, prettyHtml)
}
function minMixed(s: string): string {
  return transformBlocks(s, { script: minJs, style: minCss }, minHtml)
}

type BlockKind = 'script' | 'style'

function transformBlocks(
  html: string,
  transforms: Record<BlockKind, (code: string) => string>,
  htmlTransform: (h: string) => string
): string {
  const parts: string[] = []
  let last = 0
  const re = /<(script|style)(\b[^>]*)>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const kind = m[1].toLowerCase() as BlockKind
    const open = m[0].slice(0, m[0].indexOf('>') + 1)
    const close = `</${kind}>`
    const code = m[3] || ''
    parts.push(html.slice(last, m.index))
    let transformed = ''
    try {
      transformed = transforms[kind](code)
    } catch {
      transformed = code
    }
    parts.push(open + '\n' + transformed + (transformed.endsWith('\n') ? '' : '\n') + close)
    last = m.index + m[0].length
  }
  parts.push(html.slice(last))
  const stitched = parts.join('')
  const cleaned = stitched.replace(/<!--[\s\S]*?-->/g, '')
  return protectBlocks(cleaned, (inner) => inner, htmlTransform)
}

function protectBlocks(
  html: string,
  onInner: (inner: string, tag: string) => string,
  after?: (h: string) => string
): string {
  const map = new Map<string, string>()
  let idx = 0
  const replaced = html.replace(
    /<(script|style)(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_all, tag: string, attrs: string, inner: string) => {
      const key = `__SNAPPO_BLOCK_${idx++}__`
      map.set(key, `<${tag}${attrs}>` + onInner(inner, tag) + `</${tag}>`)
      return key
    }
  )
  const processed = after ? after(replaced) : replaced
  return processed.replace(/__SNAPPO_BLOCK_\d+__/g, (k) => map.get(k) || k)
}
