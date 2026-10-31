import type { FileRejection } from "react-dropzone-esm"
import { toast } from "sonner"
import { formatFileSize } from "~/utils/file-size"

type Translate = (ja: string, en: string) => string

/**
 * 選択・ドロップで受け付けなかったファイルの理由を伝える
 * ドロップゾーンの maxSize や accept で弾いたファイルは onDrop に来ないので、何も起きないように見えていた
 */
export const notifyRejectedFiles = (
  fileRejections: FileRejection[],
  t: Translate,
  maxSizeBytes: number,
): void => {
  for (const rejection of fileRejections) {
    const name = rejection.file.name
    const codes = rejection.errors.map((error) => error.code)
    if (codes.includes("file-too-large")) {
      const size = formatFileSize(rejection.file.size)
      const max = formatFileSize(maxSizeBytes)
      toast.error(
        t(
          `「${name}」は${size}あり、${max}を超えているため追加できません。ビットレートや解像度を下げて${max}以下にしてください`,
          `"${name}" is ${size}, which exceeds ${max}. Please reduce the bitrate or resolution to under ${max}.`,
        ),
      )
      continue
    }
    if (codes.includes("file-invalid-type")) {
      toast.error(
        t(
          `「${name}」はこの形式に対応していないため追加できません`,
          `"${name}" is not a supported file type.`,
        ),
      )
      continue
    }
    if (codes.includes("too-many-files")) {
      toast.error(t("一度に選べる数を超えています", "Too many files selected."))
      return
    }
    toast.error(
      t(`「${name}」を追加できませんでした`, `Could not add "${name}".`),
    )
  }
}
