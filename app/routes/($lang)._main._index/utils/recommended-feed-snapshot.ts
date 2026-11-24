/**
 * 「あなたへのおすすめ」の最初の一覧を端末に覚えておく。
 * あなた向けの並びはサーバーで計算するので初回は 1 秒ほどかかり、届くまでは全員向けの一覧が出て、届くと全部入れ替わっていた。
 * 次に開いたときは前回の一覧を先に出し、その回は入れ替えない（取り直した並びは次回のために覚える）
 */
const STORAGE_KEY = "aipictors:recommended-feed-snapshot:v1"

/** これより古い一覧は使わない（おすすめは直近 3 日の作品から選ぶので、半日もたつと古い） */
export const RECOMMENDED_SNAPSHOT_MAX_AGE_MS = 6 * 60 * 60 * 1000

const MAX_ITEMS = 32

export type RecommendedFeedSnapshot<T> = {
  userId: string
  /** 年齢制限の組み合わせ（"G,R15" など） */
  ratingsKey: string
  savedAt: number
  works: T[]
}

/** 使える一覧（同じ人・同じ年齢制限で、古すぎないもの）。なければ null */
export const pickRecommendedFeedSnapshot = <T>(
  snapshot: RecommendedFeedSnapshot<T> | null,
  props: { userId: string; ratingsKey: string; now: number },
): T[] | null => {
  if (snapshot === null || typeof snapshot !== "object") return null
  if (snapshot.userId !== props.userId) return null
  if (snapshot.ratingsKey !== props.ratingsKey) return null
  if (typeof snapshot.savedAt !== "number") return null
  const age = props.now - snapshot.savedAt
  if (age < 0 || age > RECOMMENDED_SNAPSHOT_MAX_AGE_MS) return null
  if (!Array.isArray(snapshot.works) || snapshot.works.length === 0) return null
  return snapshot.works
}

export const readRecommendedFeedSnapshot = <
  T,
>(): RecommendedFeedSnapshot<T> | null => {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as RecommendedFeedSnapshot<T> | null
  } catch {
    return null
  }
}

export const saveRecommendedFeedSnapshot = <T>(
  snapshot: RecommendedFeedSnapshot<T>,
) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...snapshot,
        works: snapshot.works.slice(0, MAX_ITEMS),
      }),
    )
  } catch {
    // 保存できなくても、読み込みを待つだけ
  }
}
