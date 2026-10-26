import { createImageFiles } from "~/routes/($lang).generation._index/utils/create-image-files"
import { downloadZipFile } from "~/routes/($lang).generation._index/utils/download-zip-file"
import { toGenerationImageFileNames } from "~/routes/($lang).generation._index/utils/to-generation-image-file-names"

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

  // 展開したときに生成順に並ぶよう「生成日時_連番」のファイル名にする
  const fileNames = toGenerationImageFileNames(files)

  await downloadZipFile({
    name: "images",
    files: files.map((file, index) => ({
      name: fileNames[index],
      data: file.data,
    })),
  })
}
