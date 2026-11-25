import { autoMosaicImage, isAnimatedImageDataUrl } from "~/utils/auto-mosaic"

export type PostAutoMosaicProgress = {
  done: number
  total: number
  /** いま処理している画像（処理中の表示に使う） */
  preview: string | null
}

export type PostAutoMosaicResult = {
  /** 投稿する画像（items と同じ並び）。モザイクが要らなかった画像は元のまま */
  contents: (string | null)[]
  thumbnailBase64: string
  ogpBase64: string | null
  /** モザイクをかけた画像の枚数（サムネイル・OGP は数えない） */
  mosaicImageCount: number
  /** 処理できなかった画像の枚数（GIF などの対象外は数えない） */
  failedCount: number
}

/** R18 / R18G の投稿は、投稿するときに自動でモザイクをかける（乳首は対象外） */
export const isAutoMosaicRating = (rating: string | null | undefined) =>
  rating === "R18" || rating === "R18G"

const canMosaic = (content: string | null | undefined): content is string =>
  Boolean(content) && !isAnimatedImageDataUrl(content as string)

/**
 * 投稿する画像・サムネイル・OGP に自動モザイクをかける（ブラウザの中だけで処理する）
 * サムネイルが 1 枚目の画像と同じときは、かけ直さずに 1 枚目の結果を使う
 */
export async function applyPostAutoMosaic(input: {
  contents: (string | null)[]
  thumbnailBase64: string
  ogpBase64: string | null
  onProgress?: (progress: PostAutoMosaicProgress) => void
}): Promise<PostAutoMosaicResult> {
  const isThumbnailFirstImage =
    input.contents.length > 0 && input.thumbnailBase64 === input.contents[0]
  const extraTargets = [
    !isThumbnailFirstImage && canMosaic(input.thumbnailBase64),
    canMosaic(input.ogpBase64),
  ].filter(Boolean).length
  const total =
    input.contents.filter((content) => canMosaic(content)).length + extraTargets

  let done = 0
  let failedCount = 0
  let mosaicImageCount = 0

  const mosaic = async (content: string, isWorkImage: boolean) => {
    input.onProgress?.({ done, total, preview: content })
    try {
      const result = await autoMosaicImage(content)
      if (result.dataUrl !== null && isWorkImage) mosaicImageCount++
      return result.dataUrl ?? content
    } catch (error) {
      console.error(error)
      failedCount++
      return content
    } finally {
      done++
      input.onProgress?.({ done, total, preview: content })
    }
  }

  const contents: (string | null)[] = []
  for (const content of input.contents) {
    contents.push(canMosaic(content) ? await mosaic(content, true) : content)
  }

  let thumbnailBase64 = input.thumbnailBase64
  if (isThumbnailFirstImage) {
    thumbnailBase64 = contents[0] ?? input.thumbnailBase64
  } else if (canMosaic(input.thumbnailBase64)) {
    thumbnailBase64 = await mosaic(input.thumbnailBase64, false)
  }

  const ogpBase64 = canMosaic(input.ogpBase64)
    ? await mosaic(input.ogpBase64, false)
    : input.ogpBase64

  return {
    contents,
    thumbnailBase64,
    ogpBase64,
    mosaicImageCount,
    failedCount,
  }
}
