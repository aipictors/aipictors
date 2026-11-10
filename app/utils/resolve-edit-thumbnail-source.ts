import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

type WorkThumbnailUrls = {
  imageURL?: string | null
  largeThumbnailImageURL?: string | null
}

/**
 * 編集で先頭を別の投稿済み画像に変えたか（投稿済みの画像はフォームに URL のまま入っている）
 */
export const isExistingThumbnailImageChanged = (
  thumbnail: string,
  work: WorkThumbnailUrls,
) =>
  thumbnail.startsWith("https://") &&
  thumbnail !== work.imageURL &&
  thumbnail !== work.largeThumbnailImageURL

/**
 * サムネイルの元にする画像を返す。先頭が別の投稿済み画像に変わっていたら、作り直せるように Base64 にする
 * 取得できないときは URL のまま返す（今のサムネイルのまま保存できるように）
 */
export const resolveEditThumbnailSource = async (
  thumbnail: string,
  work: WorkThumbnailUrls,
) => {
  if (!isExistingThumbnailImageChanged(thumbnail, work)) {
    return thumbnail
  }
  try {
    return await getBase64FromImageUrl(thumbnail, "image/webp")
  } catch {
    return thumbnail
  }
}
