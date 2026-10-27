import { DownloadIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { downloadImageFile } from "~/routes/($lang).generation._index/utils/download-image-file"

type Props = {
  taskNanoid: string | null
  imageUrl: string
  className?: string
}

/**
 * 生成履歴のサムネイル上のダウンロードボタン
 * PC はカーソルを乗せたとき、スマホは常に表示する
 */
export function GenerationTaskDownloadButton(props: Props) {
  const t = useTranslation()

  const [isDownloading, setIsDownloading] = useState(false)

  const onDownload = async (event: React.MouseEvent) => {
    // サムネイルのクリック（詳細を開く）にしない
    event.preventDefault()
    event.stopPropagation()
    if (isDownloading) return
    if (!props.imageUrl) {
      toast(t("画像が存在しません", "The image does not exist"))
      return
    }

    // 表示に失敗して元の URL に切り替えた画像は、ダウンロードも元の URL を使う
    const imageElement = props.taskNanoid
      ? document.querySelector<HTMLImageElement>(
          `.generation-image-${props.taskNanoid}`,
        )
      : null
    const isFallback = imageElement?.dataset.generativeFallback === "true"
    const resolvedUrl = imageElement?.dataset.original ?? props.imageUrl

    const name = new Date().toISOString().replace(/[^0-9]/g, "")

    setIsDownloading(true)
    try {
      await downloadImageFile(name, resolvedUrl, {
        skipGenerativeNormalization: isFallback,
        convertToPng: true,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      type="button"
      aria-label={t("画像をダウンロード", "Download image")}
      title={t("ダウンロード", "Download")}
      disabled={isDownloading}
      onClick={onDownload}
      className={cn(
        "absolute top-2 left-2 z-10 flex size-8 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm transition-opacity hover:bg-black/75 focus-visible:opacity-100",
        props.className,
      )}
    >
      {isDownloading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <DownloadIcon className="size-4" />
      )}
    </button>
  )
}
