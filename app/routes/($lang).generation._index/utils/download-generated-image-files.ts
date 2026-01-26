import { submitZipDownloadForm } from "~/routes/($lang).generation._index/utils/submit-zip-download-form"

/**
 * 画像ファイルをZip形式でダウンロードする
 * @param imageIds
 */
export async function downloadGeneratedImageFiles(imageIds: string[]) {
  const urls: string[] = []

  for (const imageId of imageIds) {
    const imageElement = document.querySelector<HTMLElement>(
      `.generation-image-${imageId}`,
    )

    const rawUrl =
      imageElement?.dataset.original ??
      (imageElement instanceof HTMLImageElement ? imageElement.src : undefined)

    if (rawUrl) {
      const absoluteUrl = new URL(rawUrl, window.location.href).toString()
      urls.push(absoluteUrl)
    }
  }

  if (urls.length === 0) {
    throw new Error("画像が存在しません")
  }

  // User-gesture friendly download: submit a form POST so the browser downloads the response.
  submitZipDownloadForm({
    urls,
    name: "images",
  })
}
