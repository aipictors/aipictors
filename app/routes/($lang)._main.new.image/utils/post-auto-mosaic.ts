import type { TSortableItem } from "~/components/drag/sortable-item"
import {
  canPostMosaic,
  getItemMosaicSource,
  getPostMosaicDetection,
  hasItemMosaic,
  isItemMosaicSuggested,
} from "~/routes/($lang)._main.new.image/utils/post-mosaic-store"

export type PostAutoMosaicProgress = {
  done: number
  total: number
  /** いま処理している画像（処理中の表示に使う） */
  preview: string | null
}

/** モザイクが必要な年齢種別（R18 / R18G）。おすすめのモザイクはこのときだけ出す */
export const isAutoMosaicRating = (rating: string | null | undefined) =>
  rating === "R18" || rating === "R18G"

/**
 * 全年齢・R15 の投稿で「R-18 がおすすめ」と出す確からしさ。
 * R18 のおすすめのモザイク（0.22 以上）より高くして、見間違いで R-18 を勧めないようにする
 * （全年齢・R15 の公開作品 256 枚で 0.4 だと 17 枚、0.6 だと 7 枚に出る。通報作品などの本物は 25 枚中 18 枚）
 */
export const SENSITIVE_RATING_MIN_SCORE = 0.6

/** R-18 がおすすめの画像の枚数（検出が終わった画像だけ数える） */
export const countSensitivePostImages = (items: TSortableItem[]) =>
  items.filter((item) => {
    const source = getItemMosaicSource(item)
    if (!source || !canPostMosaic(source)) return false
    const detection = getPostMosaicDetection(source)
    return (
      detection?.status === "done" &&
      detection.maxScore >= SENSITIVE_RATING_MIN_SCORE
    )
  }).length

/** おすすめのモザイクがまだかかっていない画像の枚数 */
export const countSuggestedMosaicImages = (items: TSortableItem[]) =>
  items.filter(isItemMosaicSuggested).length

/**
 * 投稿する画像をまとめる（自動ではかけない。投稿者がかけたモザイクをそのまま使う）
 * サムネイル・OGP が一覧の画像（モザイクをかける前の画像を含む）と同じなら、一覧の今の画像を使う
 */
export function resolvePostMosaicImages(input: {
  items: TSortableItem[]
  thumbnailBase64: string
  ogpBase64: string | null
}) {
  const resolve = (content: string | null) => {
    if (!content) return content
    const item = input.items.find(
      (item) =>
        item.content === content || getItemMosaicSource(item) === content,
    )
    return item?.content ?? content
  }
  return {
    contents: input.items.map((item) => item.content),
    thumbnailBase64: resolve(input.thumbnailBase64) ?? input.thumbnailBase64,
    ogpBase64: resolve(input.ogpBase64),
    mosaicImageCount: input.items.filter(hasItemMosaic).length,
  }
}
