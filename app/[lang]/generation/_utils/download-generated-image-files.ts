import { createImageFiles } from "@/[lang]/generation/_utils/create-image-files"
import { downloadZipFile } from "@/[lang]/generation/_utils/download-zip-file"
import { config } from "@/config"

/**
 * 画像ファイルをZip形式でダウンロードする
 * @param imageIds
 */
export async function downloadGeneratedImageFiles(imageIds: string[]) {
  if (config.isDevelopmentMode) {
    await new Promise((resolve) => setTimeout(resolve, 4000))
  }

  /**
   * 画像ファイル
   */
  const files = await createImageFiles({
    imageIds: imageIds,
    toSelector(id) {
      return `.generation-image-${id}`
    },
    dataName: "original",
  })

  // 画像を圧縮してダウンロードする
  await downloadZipFile(files)
}
