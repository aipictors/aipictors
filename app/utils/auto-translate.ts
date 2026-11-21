import type { SupportedLocale } from "~/utils/locale-path"

const JAPANESE = /[぀-ヿ㐀-䶿一-鿿]/
/** /api/translate に 1 回で送る数と、1 つの文の長さ（サーバーと同じ） */
const MAX_TEXTS_PER_REQUEST = 50
const MAX_TEXT_LENGTH = 3000
/** 1 ページで訳す数（訳はサーバーに残るが、まだ訳していない文は Apps Script の 1 日の回数を使う） */
const MAX_TEXTS_PER_PAGE = 150

/**
 * 自動で翻訳する文か。英語のページの日本語、日本語のページの英語など（漢字かなのない文）を訳す
 */
export const shouldAutoTranslate = (
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

/** まとめて 1 回で訳す。訳せなかった文は空 */
const translateBatch = async (batch: Pending[]) => {
  const translations = await fetch("/api/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      texts: batch.map((item) => item.text),
      target: batch[0].target,
    }),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then(
      (json) =>
        (json as { data?: { translations?: unknown } } | null)?.data
          ?.translations,
    )
    .catch(() => null)
  batch.forEach((item, index) => {
    const value = Array.isArray(translations) ? translations[index] : null
    item.resolve(typeof value === "string" ? value : "")
  })
}

const flush = () => {
  timer = null
  const items = pending
  pending = []
  for (const target of ["ja", "en"] as const) {
    const targetItems = items.filter((item) => item.target === target)
    for (let i = 0; i < targetItems.length; i += MAX_TEXTS_PER_REQUEST) {
      void translateBatch(targetItems.slice(i, i + MAX_TEXTS_PER_REQUEST))
    }
  }
}

/**
 * 利用者が書いた文を訳す（同じ文は 1 回だけ、近いタイミングのものはまとめる）。訳せなければ空文字
 */
export const translateAutomatically = (
  text: string,
  target: SupportedLocale,
): Promise<string> => {
  const trimmed = text.trim()
  const key = `${target}:${trimmed}`
  const cached = cache.get(key)
  if (cached) return cached
  if (
    trimmed === "" ||
    requestedCount >= MAX_TEXTS_PER_PAGE ||
    trimmed.length > MAX_TEXT_LENGTH
  ) {
    return Promise.resolve("")
  }
  requestedCount += 1
  const promise = new Promise<string>((resolve) => {
    pending.push({ text: trimmed, target, resolve })
    timer ??= setTimeout(flush, 80)
  })
  cache.set(key, promise)
  return promise
}
