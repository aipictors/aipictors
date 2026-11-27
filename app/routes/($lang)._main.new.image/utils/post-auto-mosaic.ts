import type { TSortableItem } from "~/components/drag/sortable-item"
import {
  getItemMosaicSource,
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
