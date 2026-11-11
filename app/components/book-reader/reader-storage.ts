/**
 * 本のように読む画面の設定・しおり・続きの位置（この端末の localStorage に保存する）
 */

export type ReaderFont = "shippori" | "mincho" | "gothic" | "maru"
export type ReaderTheme = "paper" | "sepia" | "night" | "eink"
export type ReaderWriting = "vertical" | "horizontal"
export type ReaderLayout = "auto" | "single" | "spread"
export type ReaderLineHeight = "tight" | "normal" | "loose"

export type ReaderSettings = {
  /** FONT_SIZES の番号 */
  fontSize: number
  font: ReaderFont
  theme: ReaderTheme
  writing: ReaderWriting
  layout: ReaderLayout
  lineHeight: ReaderLineHeight
  /** 中身のない段落（1 行空け）を半分の高さに詰める */
  compactBlankLines: boolean
  /** ページをめくるときの動き */
  pageAnimation: boolean
}

/** 本文の位置（段落の番号と、その段落の何ページ目か） */
export type ReaderPosition = { block: number; fragment: number }

export type ReaderBookmark = ReaderPosition & {
  createdAt: number
  excerpt: string
}

export type ReaderProgress = {
  position: ReaderPosition | null
  bookmarks: ReaderBookmark[]
  updatedAt: number
}

export const FONT_SIZES = [14, 15, 16, 17, 18, 20, 22, 24, 27, 30] as const

export const FONT_LABELS: Record<ReaderFont, string> = {
  shippori: "しっぽり",
  mincho: "明朝",
  gothic: "ゴシック",
  maru: "丸ゴシック",
}

export const FONT_FAMILIES: Record<ReaderFont, string> = {
  shippori:
    '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", YuMincho, "Noto Serif JP", serif',
  mincho:
    '"Hiragino Mincho ProN", "Yu Mincho", YuMincho, "Noto Serif JP", "Shippori Mincho", serif',
  gothic:
    '"Zen Kaku Gothic New", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", YuGothic, "Noto Sans JP", sans-serif',
  maru: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Hiragino Sans", "Yu Gothic", sans-serif',
}

/** Google Fonts から読み込む書体（端末にある明朝は読み込まない） */
export const WEB_FONT_URLS: Partial<Record<ReaderFont, string>> = {
  shippori:
    "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&display=swap",
  gothic:
    "https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700&display=swap",
  maru: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700&display=swap",
}

export const LINE_HEIGHTS: Record<
  ReaderLineHeight,
  { horizontal: number; vertical: number }
> = {
  tight: { horizontal: 1.65, vertical: 1.7 },
  normal: { horizontal: 1.85, vertical: 1.9 },
  loose: { horizontal: 2.1, vertical: 2.15 },
}

const SETTINGS_KEY = "aipictors:book-reader:settings"
const progressKey = (workId: string) => `aipictors:book-reader:work:${workId}`

/** 小説は縦書き、コラムは横書きから始める */
export const defaultSettings = (
  workType: "NOVEL" | "COLUMN",
): ReaderSettings => ({
  fontSize: 3,
  font: workType === "NOVEL" ? "shippori" : "gothic",
  theme: "paper",
  writing: workType === "NOVEL" ? "vertical" : "horizontal",
  layout: "auto",
  lineHeight: "normal",
  compactBlankLines: true,
  pageAnimation: true,
})

const readJson = (key: string): unknown => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 容量オーバー・プライベートブラウズでは覚えない（読むことはできる）
  }
}

/** 設定は小説・コラムで別に覚える（縦書き・書体の好みが違うため） */
export const loadSettings = (workType: "NOVEL" | "COLUMN"): ReaderSettings => {
  const base = defaultSettings(workType)
  const saved = readJson(`${SETTINGS_KEY}:${workType}`)
  if (saved === null || typeof saved !== "object") return base
  const merged = { ...base, ...(saved as Partial<ReaderSettings>) }
  merged.fontSize = Math.min(
    FONT_SIZES.length - 1,
    Math.max(0, Math.trunc(Number(merged.fontSize) || 0)),
  )
  if (!(merged.font in FONT_FAMILIES)) merged.font = base.font
  return merged
}

export const saveSettings = (
  workType: "NOVEL" | "COLUMN",
  settings: ReaderSettings,
) => writeJson(`${SETTINGS_KEY}:${workType}`, settings)

const isPosition = (value: unknown): value is ReaderPosition =>
  typeof value === "object" &&
  value !== null &&
  Number.isInteger((value as ReaderPosition).block) &&
  Number.isInteger((value as ReaderPosition).fragment)

export const loadProgress = (workId: string): ReaderProgress => {
  const saved = readJson(progressKey(workId)) as Partial<ReaderProgress> | null
  return {
    position: isPosition(saved?.position) ? saved.position : null,
    bookmarks: Array.isArray(saved?.bookmarks)
      ? saved.bookmarks.filter(isPosition).slice(0, 100)
      : [],
    updatedAt: Number(saved?.updatedAt) || 0,
  }
}

export const saveProgress = (workId: string, progress: ReaderProgress) =>
  writeJson(progressKey(workId), { ...progress, updatedAt: Date.now() })
