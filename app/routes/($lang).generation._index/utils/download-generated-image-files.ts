import { createImageFiles } from "~/routes/($lang).generation._index/utils/create-image-files"
import { downloadZipFile } from "~/routes/($lang).generation._index/utils/download-zip-file"

/**
 * 画像ファイルをZip形式でダウンロードする
 * @param imageIds
 */
export async function downloadGeneratedImageFiles(imageIds: string[]) {
  if (imageIds.length === 0) {
    throw new Error("画像が存在しません")
  }

  const files = await createImageFiles({
    imageIds,
    toSelector: (id) => `.generation-image-${id}`,
    dataName: "original",
  })

  if (files.length === 0) {
    throw new Error("画像が存在しません")
  }

  await downloadZipFile({
    name: "images",
    files,
  })
}
