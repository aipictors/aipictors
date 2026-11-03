import type { FontFamilyOption } from "~/routes/($lang)._main.stickers._index/types/sticker-layer"
import { CANVAS_SIZE } from "~/routes/($lang)._main.stickers._index/utils/sticker-canvas-size"

export const fontFamilies: FontFamilyOption[] = [
  {
    label: "丸み",
    value: "'M PLUS Rounded 1c', system-ui",
    weights: [400, 700, 900],
  },
  {
    label: "ゴシック",
    value: "'Noto Sans JP', system-ui",
    weights: [400, 700, 900],
  },
  {
    label: "明朝",
    value: "'Noto Serif JP', serif",
    weights: [400, 700, 900],
  },
  { label: "手書き風", value: "'Yomogi', system-ui", weights: [400] },
]

export const DEFAULT_TEXT_FONT_WEIGHT = 400

export const getFontWeightsForFamily = (fontFamily: string) => {
  return (
    fontFamilies.find((f) => f.value === fontFamily)?.weights ?? [
      DEFAULT_TEXT_FONT_WEIGHT,
    ]
  )
}

export const normalizeFontWeightForFamily = (props: {
  fontFamily: string
  fontWeight: number
}) => {
  const weights = getFontWeightsForFamily(props.fontFamily)
  if (weights.length === 0) return DEFAULT_TEXT_FONT_WEIGHT
  if (weights.includes(props.fontWeight)) return props.fontWeight

  // 近いウェイトへスナップ（スライダー100刻みでもフォント側が未対応の値があり得るため）
  let nearest = weights[0] ?? DEFAULT_TEXT_FONT_WEIGHT
  let nearestDiff = Math.abs(nearest - props.fontWeight)
  for (const weight of weights) {
    const diff = Math.abs(weight - props.fontWeight)
    if (diff < nearestDiff) {
      nearest = weight
      nearestDiff = diff
    }
  }
  return nearest
}

export const clampFontWeight = (weight: number) =>
  Math.max(100, Math.min(900, Math.round(weight / 100) * 100))

export const splitLines = (text: string) => text.split(/\r?\n/)

export const toVerticalColumns = (text: string) => {
  const lines = splitLines(text)
  if (lines.length <= 1) return lines

  // 1行=1文字（例: あ\nい\nう…）の場合は、ユーザーが期待する
  // 「1列で縦に積む」表現として扱う（CSSだと改行が列送りになってしまうため）。
  const isSingleGlyphLines = lines.every((line) => Array.from(line).length <= 1)
  if (!isSingleGlyphLines) return lines

  const joined = lines.map((line) => (line.length === 0 ? "　" : line)).join("")
  return [joined]
}

export const normalizeVerticalPreviewText = (text: string) => {
  const cols = toVerticalColumns(text)
  // 1列に正規化された場合のみ改行を除去
  if (cols.length === 1) return cols[0] ?? ""
  return text
}

export const computeTextLayerBox = (props: {
  text: string
  fontSize: number
  vertical: boolean
}) => {
  const fontSize = Math.max(8, props.fontSize)
  const padding = 12
  const lineHeight = fontSize * 1.1

  if (props.vertical) {
    const columns = toVerticalColumns(props.text)
    const columnCount = Math.max(1, columns.length)
    const glyphCounts = columns.map((col) => Array.from(col).length)
    const maxGlyphs = Math.max(1, ...glyphCounts)

    const width = Math.round(columnCount * lineHeight + padding)
    const height = Math.round(maxGlyphs * lineHeight + padding)

    return {
      width: Math.max(48, Math.min(CANVAS_SIZE, width)),
      height: Math.max(48, Math.min(CANVAS_SIZE, height)),
    }
  }

  // 横書きは従来の箱をベースにしつつ、複数行の場合は高さだけ少し伸ばす
  const lines = splitLines(props.text)
  const lineCount = Math.max(1, lines.length)
  const height = Math.round(Math.max(140, lineCount * lineHeight + padding))
  return {
    width: 260,
    height: Math.max(48, Math.min(CANVAS_SIZE, height)),
  }
}
