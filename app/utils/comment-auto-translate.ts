import type { SupportedLocale } from "~/utils/locale-path"
import { translateText } from "~/utils/translate-text"

const JAPANESE = /[぀-ヿ㐀-䶿一-鿿]/
const SEPARATOR = "\n§§§\n"
/** 翻訳の URL に入る長さ（日本語は 1 文字 9 バイトになる） */
const MAX_ENCODED_LENGTH = 8000
/** 1 ページで翻訳する数（サイト全体で 1 日の回数に上限がある） */
const MAX_TEXTS_PER_PAGE = 40

/**
 * 自動で翻訳するコメントか。英語のページの日本語、日本語のページの英語など（漢字かなのない文）を訳す
 */
export const shouldAutoTranslateComment = (
  text: string | null | undefined,
  locale: SupportedLocale,
): boolean => {
  if (!text) return false
  const isJapanese = JAPANESE.test(text)
  if (locale === "en") return isJapanese
  return !isJapanese && /\p{L}{3}/u.test(text)
}

type Pending = {
  text: string
  target: SupportedLocale
  resolve: (value: string) => void
}

const cache = new Map<string, Promise<string>>()
let pending: Pending[] = []
let timer: ReturnType<typeof setTimeout> | null = null
let requestedCount = 0

/** まとめて 1 回で翻訳する。区切りの数が合わなければ空を返す（手動の翻訳は残っている） */
const translateBatch = async (batch: Pending[]) => {
  const result = await translateText({
    text: batch.map((item) => item.text).join(SEPARATOR),
    targetLanguage: batch[0].target,
  }).catch(() => "")
  const parts = result.split(/\s*§§§\s*/)
  batch.forEach((item, index) => {
    item.resolve(parts.length === batch.length ? parts[index].trim() : "")
  })
}

const flush = () => {
  timer = null
  const items = pending
  pending = []
  for (const target of ["ja", "en"] as const) {
    let batch: Pending[] = []
    let length = 0
    for (const item of items.filter((value) => value.target === target)) {
      const itemLength = encodeURIComponent(item.text).length
      if (batch.length > 0 && length + itemLength > MAX_ENCODED_LENGTH) {
        void translateBatch(batch)
        batch = []
        length = 0
      }
      batch.push(item)
      length += itemLength + 30
    }
    if (batch.length > 0) void translateBatch(batch)
  }
}

/**
 * コメントを翻訳する（同じ文は 1 回だけ、近いタイミングのものはまとめる）。訳せなければ空文字
 */
export const translateCommentAutomatically = (
  text: string,
  target: SupportedLocale,
): Promise<string> => {
  const key = `${target}:${text}`
  const cached = cache.get(key)
  if (cached) return cached
  if (
    requestedCount >= MAX_TEXTS_PER_PAGE ||
    encodeURIComponent(text).length > MAX_ENCODED_LENGTH
  ) {
    return Promise.resolve("")
  }
  requestedCount += 1
  const promise = new Promise<string>((resolve) => {
    pending.push({ text, target, resolve })
    timer ??= setTimeout(flush, 80)
  })
  cache.set(key, promise)
  return promise
}
