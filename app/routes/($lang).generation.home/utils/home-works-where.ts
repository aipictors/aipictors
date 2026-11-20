/**
 * 生成のトップに並べる作例の絞り込み
 * - 全年齢・センシティブではない・Aipictors で生成した作品で、プロンプトを公開しているものだけ
 * - 期間を日単位で区切って、同じ日のあいだは同じ条件（＝ API・ページのキャッシュが効く）にする
 */

export type GenerationHomeFilter =
  | { kind: "popular" }
  | { kind: "latest" }
  | { kind: "tag"; tag: string }

/**
 * 並べるタグ（全年齢・プロンプト公開の生成作品がある程度あるもの）
 */
export const GENERATION_HOME_TAGS: { tag: string; enLabel: string }[] = [
  { tag: "女の子", enLabel: "Girls" },
  { tag: "ファンタジー", enLabel: "Fantasy" },
  { tag: "制服", enLabel: "Uniform" },
  { tag: "メイド", enLabel: "Maid" },
  { tag: "夜景", enLabel: "Night view" },
  { tag: "猫", enLabel: "Cats" },
  { tag: "和服", enLabel: "Kimono" },
  { tag: "ロボット", enLabel: "Robots" },
  { tag: "ちびキャラ", enLabel: "Chibi" },
]

export const GENERATION_HOME_PAGE_SIZE = 40

/**
 * 「もっと見る」で読む最大のページ数（重い読み込みを続けないように）
 */
export const GENERATION_HOME_MAX_PAGES = 4

const daysAgo = (now: Date, days: number) => {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString()
}

export function toGenerationHomeWorksWhere(
  filter: GenerationHomeFilter,
  now: Date,
) {
  const base = {
    ratings: ["G" as const],
    isSensitive: false,
    isFeatured: true,
    hasPrompt: true,
    isPromptPublic: true,
  }
  if (filter.kind === "latest") {
    return {
      ...base,
      orderBy: "DATE_CREATED" as const,
      createdAtAfter: daysAgo(now, 7),
    }
  }
  if (filter.kind === "tag") {
    return {
      ...base,
      tagNames: [filter.tag],
      orderBy: "LIKES_COUNT" as const,
      createdAtAfter: daysAgo(now, 90),
    }
  }
  return {
    ...base,
    orderBy: "LIKES_COUNT" as const,
    createdAtAfter: daysAgo(now, 30),
  }
}
