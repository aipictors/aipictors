import type { TSortableItem } from "~/components/drag/sortable-item"
import {
  canPostMosaic,
  createAutoMosaicItem,
  getItemMosaicSource,
  getPostMosaicDetection,
  hasItemMosaic,
  isItemMosaicWarning,
  type PostMosaicSettings,
  renderPostMosaic,
  waitPostMosaicDetections,
} from "~/routes/($lang)._main.new.image/utils/post-mosaic-store"

export type PostAutoMosaicProgress = {
  done: number
  total: number
  /** いま処理している画像（処理中の表示に使う） */
  preview: string | null
}

export type PostAutoMosaicResult = {
  /** 投稿する画像（items と同じ並び） */
  contents: (string | null)[]
  thumbnailBase64: string
  ogpBase64: string | null
  /** モザイクがかかっている画像の枚数（サムネイル・OGP は数えない） */
  mosaicImageCount: number
  /** 検出できなかった画像の枚数（GIF などの対象外は数えない） */
  failedCount: number
  /** 「自分でかけ済み」のとき、隠れていないように見える所がある画像の枚数 */
  warningCount: number
}

/** R18 / R18G の投稿は自動でモザイクをかける（乳首は対象外） */
export const isAutoMosaicRating = (rating: string | null | undefined) =>
  rating === "R18" || rating === "R18G"

/**
 * 投稿の直前に、プレビューでかけたモザイクを確かめて仕上げる（ブラウザの中だけで処理する）
 * - 検出がまだ終わっていない画像は待つ
 * - 自動でかけるとき: まだかかっていない画像にかける。別に選んだサムネイル・OGP にもかける
 * - 自分でかけ済みのとき: 画像はそのまま。隠れていないように見える画像を数える
 */
export async function finalizePostMosaic(input: {
  items: TSortableItem[]
  thumbnailBase64: string
  ogpBase64: string | null
  isSelfApplied: boolean
  settings: PostMosaicSettings
  onProgress?: (progress: PostAutoMosaicProgress) => void
}): Promise<PostAutoMosaicResult> {
  const sources = input.items.flatMap((item) => {
    const source = getItemMosaicSource(item)
    return source && canPostMosaic(source) ? [source] : []
  })
  // 1 枚目と同じでないサムネイル・OGP（自動でかけるときだけ）
  const isOwnContent = (content: string | null) =>
    content !== null &&
    input.items.some(
      (item) =>
        item.content === content || getItemMosaicSource(item) === content,
    )
  const extras = input.isSelfApplied
    ? []
    : [input.thumbnailBase64, input.ogpBase64].filter(
        (content): content is string =>
          Boolean(content) && canPostMosaic(content) && !isOwnContent(content),
      )

  await waitPostMosaicDetections([...sources, ...extras], (done, total) => {
    input.onProgress?.({
      done,
      total,
      preview: sources[Math.min(done, sources.length - 1)] ?? null,
    })
  })

  if (input.isSelfApplied) {
    return {
      contents: input.items.map((item) => item.content),
      thumbnailBase64: input.thumbnailBase64,
      ogpBase64: input.ogpBase64,
      mosaicImageCount: input.items.filter(hasItemMosaic).length,
      failedCount: 0,
      warningCount: input.items.filter(isItemMosaicWarning).length,
    }
  }

  let failedCount = 0
  const finalItems: TSortableItem[] = []
  for (const item of input.items) {
    const source = getItemMosaicSource(item)
    // 手で直した・外した画像はそのまま
    if (!source || !canPostMosaic(source) || item.mosaic) {
      finalItems.push(item)
      continue
    }
    const detection = getPostMosaicDetection(source)
    if (detection?.status === "failed") failedCount++
    const next =
      detection?.status === "done" && detection.mask
        ? await createAutoMosaicItem(item, input.settings).catch((error) => {
            console.error(error)
            failedCount++
            return null
          })
        : null
    finalItems.push(next ?? item)
  }

  /** サムネイル・OGP: 一覧の画像ならその仕上がりを、別の画像ならそれにかける */
  const finalize = async (content: string | null) => {
    if (!content) return content
    const index = input.items.findIndex(
      (item) =>
        item.content === content || getItemMosaicSource(item) === content,
    )
    if (index !== -1) return finalItems[index].content ?? content
    if (!canPostMosaic(content)) return content
    const detection = getPostMosaicDetection(content)
    if (detection?.status !== "done" || !detection.mask) return content
    try {
      return await renderPostMosaic(content, detection.mask, input.settings)
    } catch (error) {
      console.error(error)
      return content
    }
  }

  return {
    contents: finalItems.map((item) => item.content),
    thumbnailBase64:
      (await finalize(input.thumbnailBase64)) ?? input.thumbnailBase64,
    ogpBase64: await finalize(input.ogpBase64),
    mosaicImageCount: finalItems.filter(hasItemMosaic).length,
    failedCount,
    warningCount: 0,
  }
}
