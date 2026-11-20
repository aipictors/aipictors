/**
 * 4 周年の特設ページに載せる集計（2026-11-20 に 1 回だけ集計して埋め込む。
 * 集計のやり方は ~/Documents/aipictors-anniv4/README.md）
 */
export type Anniversary4thStats = {
  /** 集計した日（JST, YYYY-MM-DD） */
  asOf: string
  /** 大きな数字（去年の 3 周年ページの数字があれば lastYear に） */
  totals: {
    key: string
    label: string
    enLabel: string
    value: number
    lastYear: number | null
  }[]
  /** 月ごとの推移（YYYY-MM） */
  monthly: {
    month: string
    works: number
    registrations: number
    /** 分からない月は null */
    generations: number | null
  }[]
  /** 年ごとのまとめ */
  yearly: {
    year: number
    works: number
    registrations: number
    generations: number | null
  }[]
  /** 生成機のモデル利用率（期間ごと） */
  generationModels: {
    key: string
    label: string
    enLabel: string
    items: { name: string; count: number; share: number }[]
  }[]
  /** 投稿された作品に書かれていたモデル（期間ごと） */
  postedModels: {
    key: string
    label: string
    enLabel: string
    items: { name: string; count: number; share: number }[]
  }[]
  /** 人気のタグ（期間ごと） */
  tags: {
    key: string
    label: string
    enLabel: string
    items: { name: string; count: number }[]
  }[]
  /** 年齢区分の割合 */
  ratings: { label: string; share: number }[]
  /** 作品の種類の割合 */
  workTypes: { label: string; enLabel: string; share: number }[]
  /** 投稿の多い曜日 × 時間帯（JST、[曜日 0=日][時 0〜23]） */
  postHeatmap: number[][]
  /** アクセスの国（日本・海外） */
  countries: { label: string; enLabel: string; share: number }[]
  /** ちょっとした数字 */
  facts: {
    label: string
    enLabel: string
    value: string
    enValue?: string
  }[]
}
