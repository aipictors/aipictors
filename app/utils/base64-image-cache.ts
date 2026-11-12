/**
 * 画像の Data URL（Base64）の使い回し。
 *
 * 1 枚の Data URL は元画像の約 1.4 倍の長さになり、投稿画面では数枚を同時に持つ。
 * 上限なしで覚えておくとスマートフォンのブラウザが落ちるので、合計の長さで古いものから捨てる。
 */

/** 覚えておく Data URL の合計の上限（文字数。約 24MB 相当） */
const MAX_TOTAL_LENGTH = 24 * 1024 * 1024

type Entry = { promise: Promise<string>; length: number }

const cache = new Map<string, Entry>()

let totalLength = 0

/**
 * 入れた順に古いものから捨てる。読み込み中のもの（length 0）と、今入れたものは残す
 */
function evictOldest(keepKey: string) {
  for (const [key, entry] of cache) {
    if (totalLength <= MAX_TOTAL_LENGTH) {
      return
    }
    if (key === keepKey || entry.length === 0) {
      continue
    }
    cache.delete(key)
    totalLength -= entry.length
  }

  // 1 枚だけで上限を超えるときは、それも覚えておかない
  if (totalLength > MAX_TOTAL_LENGTH) {
    const entry = cache.get(keepKey)
    if (entry) {
      cache.delete(keepKey)
      totalLength -= entry.length
    }
  }
}

/**
 * 同じ URL の変換を繰り返さないように覚えておく。合計が上限を超えたら古いものから捨てる
 */
export function getOrSetCachedDataUrl(
  key: string,
  factory: () => Promise<string>,
): Promise<string> {
  const cached = cache.get(key)
  if (cached) {
    return cached.promise
  }

  const entry: Entry = { promise: Promise.resolve(""), length: 0 }

  entry.promise = factory()
    .then((dataUrl) => {
      // 捨てられていなければ、長さを数えて上限を超えた分を捨てる
      if (cache.get(key) === entry) {
        entry.length = dataUrl.length
        totalLength += dataUrl.length
        evictOldest(key)
      }
      return dataUrl
    })
    .catch((error) => {
      if (cache.get(key) === entry) {
        cache.delete(key)
        totalLength -= entry.length
      }
      throw error
    })

  cache.set(key, entry)
  return entry.promise
}

/**
 * 覚えている Data URL をすべて捨てる（投稿が終わったときなど）
 */
export function clearCachedDataUrls() {
  cache.clear()
  totalLength = 0
}
