export type RGB = { r: number; g: number; b: number }
export type HSL = { h: number; s: number; l: number }

export function clamp255(n: number): number {
  const v = Math.round(Number.isFinite(n) ? n : 0)
  return Math.max(0, Math.min(255, v))
}
export function clamp01(x: number): number {
  const v = Number.isFinite(x) ? x : 0
  return Math.max(0, Math.min(1, v))
}

export function rgbHex(input: unknown): string {
  const c = input as Partial<RGB> | null | undefined
  const r = clamp255(Number(c?.r))
  const g = clamp255(Number(c?.g))
  const b = clamp255(Number(c?.b))
  return (
    '#' +
    [r, g, b]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
      .toLowerCase()
  )
}

export function hexToRgb(hexColor: string): RGB {
  let hex = (hexColor || '').replace('#', '').trim()
  const valid = /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)
  if (!valid) return { r: 34, g: 197, b: 94 }
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('')
  const num = parseInt(hex, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return { r, g, b }
}

export function rgbToHsl(rgb: RGB): HSL {
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hue = 0
  let sat = 0
  const light = (max + min) / 2

  if (max !== min) {
    const diff = max - min
    sat = light > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    switch (max) {
      case r:
        hue = (g - b) / diff + (g < b ? 6 : 0)
        break
      case g:
        hue = (b - r) / diff + 2
        break
      default:
        hue = (r - g) / diff + 4
        break
    }
    hue *= 60
  }
  return { h: hue, s: sat, l: light }
}

export function hslToRgb(hsl: HSL): RGB {
  const chroma = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s
  const x = chroma * (1 - Math.abs(((hsl.h / 60) % 2) - 1))
  const match = hsl.l - chroma / 2

  let rr = 0
  let gg = 0
  let bb = 0

  if (0 <= hsl.h && hsl.h < 60) {
    rr = chroma
    gg = x
  } else if (60 <= hsl.h && hsl.h < 120) {
    rr = x
    gg = chroma
  } else if (120 <= hsl.h && hsl.h < 180) {
    gg = chroma
    bb = x
  } else if (180 <= hsl.h && hsl.h < 240) {
    gg = x
    bb = chroma
  } else if (240 <= hsl.h && hsl.h < 300) {
    rr = x
    bb = chroma
  } else {
    rr = chroma
    bb = x
  }

  return {
    r: clamp255((rr + match) * 255),
    g: clamp255((gg + match) * 255),
    b: clamp255((bb + match) * 255),
  }
}

export function parseColor(input: string): RGB | null {
  if (!input) return null
  const str = input.trim()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) return hexToRgb(str)

  const mRgb = str.match(/^rgb\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*,\s*|\s+)([\d.]+)\s*\)$/i)
  if (mRgb && mRgb.length >= 4) {
    const r = Number(mRgb[1])
    const g = Number(mRgb[2])
    const b = Number(mRgb[3])
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return { r: clamp255(r), g: clamp255(g), b: clamp255(b) }
    }
  }

  const mHsl = str.match(/^hsl\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)%(?:\s*,\s*|\s+)([\d.]+)%\s*\)$/i)
  if (mHsl && mHsl.length >= 4) {
    const rawH = Number(mHsl[1])
    const rawS = Number(mHsl[2])
    const rawL = Number(mHsl[3])
    if (Number.isFinite(rawH) && Number.isFinite(rawS) && Number.isFinite(rawL)) {
      const hue = ((rawH % 360) + 360) % 360
      const sat = clamp01(rawS / 100)
      const light = clamp01(rawL / 100)
      return hslToRgb({ h: hue, s: sat, l: light })
    }
  }
  return null
}

export function rotateHue(rgb: RGB, degrees: number): RGB {
  const hsl = rgbToHsl(rgb)
  const newHue = (hsl.h + degrees + 360) % 360
  return hslToRgb({ h: newHue, s: hsl.s, l: hsl.l })
}

export function mono(rgb: RGB, count: number): RGB[] {
  const hsl = rgbToHsl(rgb)
  const steps = Math.max(1, Math.floor(count))
  const out: RGB[] = []
  for (let i = 0; i < steps; i++) {
    const t = steps > 1 ? i / (steps - 1) : 0
    const l = 0.1 + 0.8 * t
    out.push(hslToRgb({ h: hsl.h, s: hsl.s * 0.9, l }))
  }
  return out
}

export function shadesTints(rgb: RGB, stepsIn: number): RGB[] {
  const hsl = rgbToHsl(rgb)
  const steps = Math.max(1, Math.floor(stepsIn))
  const out: RGB[] = []

  for (let i = steps; i >= 1; i--) {
    const l = clamp01(hsl.l * (i / (steps + 1)))
    out.push(hslToRgb({ h: hsl.h, s: hsl.s, l }))
  }
  out.push(rgb)
  for (let i = 1; i <= steps; i++) {
    const l = clamp01(hsl.l + (1 - hsl.l) * (i / (steps + 1)))
    out.push(hslToRgb({ h: hsl.h, s: hsl.s * 0.9, l }))
  }
  return out
}

export function luma(rgb: RGB): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b
}
export function dist2(a: RGB, b: RGB): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

export function scaleToFit(
  widthIn: number,
  heightIn: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  const w = Math.max(1, Math.floor(widthIn))
  const h = Math.max(1, Math.floor(heightIn))
  const ratio = Math.min(maxW / w, maxH / h, 1)
  return { width: Math.max(1, Math.round(w * ratio)), height: Math.max(1, Math.round(h * ratio)) }
}

export function kmeansTopColors(
  data: Uint8ClampedArray,
  k: number = 5,
  iterations: number = 8,
  sortRef?: RGB
): RGB[] {
  const pixels: RGB[] = []
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (!Number.isFinite(alpha) || alpha < 128) continue
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
  }
  const total = pixels.length
  if (total === 0) return []

  const clusterCount = Math.max(1, Math.min(k | 0, total))
  const centroids: RGB[] = Array.from({ length: clusterCount }, (_, idx) => {
    const pick = Math.floor((idx * total) / clusterCount)
    return pixels[pick]!
  })

  const assignment: number[] = new Array(total).fill(0)

  const maxIter = Math.max(1, iterations | 0)
  for (let iter = 0; iter < maxIter; iter++) {
    for (let i = 0; i < total; i++) {
      const px: RGB = pixels[i]!
      let bestIdx = 0
      let bestDist = Infinity
      for (let c = 0; c < clusterCount; c++) {
        const d = dist2(px, centroids[c]!)
        if (d < bestDist) {
          bestDist = d
          bestIdx = c
        }
      }
      assignment[i] = bestIdx
    }

    type Sum = { r: number; g: number; b: number; n: number }
    const sums: Sum[] = Array.from({ length: clusterCount }, () => ({ r: 0, g: 0, b: 0, n: 0 }))

    for (let i = 0; i < total; i++) {
      const idx: number = assignment[i] ?? 0
      const s: Sum = sums[idx]!
      const px: RGB = pixels[i]!
      s.r += px.r
      s.g += px.g
      s.b += px.b
      s.n++
    }

    for (let c = 0; c < clusterCount; c++) {
      const s: Sum = sums[c]!
      if (s.n > 0) {
        centroids[c] = {
          r: Math.round(s.r / s.n),
          g: Math.round(s.g / s.n),
          b: Math.round(s.b / s.n),
        }
      }
    }
  }

  if (sortRef) {
    const refY = luma(sortRef)
    return centroids.slice().sort((a, b) => Math.abs(luma(a) - refY) - Math.abs(luma(b) - refY))
  }
  return centroids
}
