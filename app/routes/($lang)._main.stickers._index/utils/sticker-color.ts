export const normalizeHexColor = (value: string) => {
  const v = value.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(v)) return v
  if (/^#[0-9a-f]{3}$/.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return "#ffffff"
}

export const hexToRgb = (hex: string) => {
  const h = normalizeHexColor(hex)
  const r = Number.parseInt(h.slice(1, 3), 16)
  const g = Number.parseInt(h.slice(3, 5), 16)
  const b = Number.parseInt(h.slice(5, 7), 16)
  return { r, g, b }
}

/**
 * 指定色に近いピクセルを透明にする（RGBA の配列をそのまま書き換える）
 */
export const applyColorKeyToPixels = (props: {
  data: Uint8ClampedArray
  colorKey: string
  threshold: number
}) => {
  const data = props.data
  const threshold = Math.max(0, Math.min(441, props.threshold))
  const feather = 16

  const key = hexToRgb(props.colorKey)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    const a = data[i + 3] ?? 255
    if (a === 0) continue

    const dr = key.r - r
    const dg = key.g - g
    const db = key.b - b
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)

    if (dist <= threshold) {
      data[i + 3] = 0
      continue
    }

    if (dist <= threshold + feather) {
      const t = (dist - threshold) / feather
      const nextA = Math.round(a * Math.max(0, Math.min(1, t)))
      data[i + 3] = nextA
    }
  }
}
