import { Button } from "~/components/ui/button"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { downloadGeneratedImageFiles } from "~/routes/($lang).generation._index/utils/download-generated-image-files"
import { useState } from "react"
import { ArrowDownToLine, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
  title?: string
  isEnable?: boolean
}

/**
 * 生成画像のZip形式のダウンロードボタン
 */
export function GenerationImageDownloadButton(props: Props) {
  const _context = useGenerationContext()

  const [isLoading, setIsLoading] = useState(false)

  const onClick = () => {
    // Keep the download trigger directly under user gesture (click)
    setIsLoading(true)
    downloadGeneratedImageFiles(props.selectedTaskIds)
      .then(() => {
        toast.success("ダウンロードを開始しました")
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          toast.error(error.message)
          return
        }
        toast.error("ダウンロードに失敗しました")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return props.isEnable ? (
    <Button
      onClick={() => {
        toast("ダウンロード対象の履歴を選択してください。")
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      size={"icon"}
    >
      <ArrowDownToLine className="w-4" />
    </Button>
  ) : (
    <Button
      title={props.title}
      disabled={props.disabled || isLoading}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      {isLoading ? (
        <Loader2 className="w-4 animate-spin" />
      ) : (
        <ArrowDownToLine className="w-4" />
      )}
    </Button>
  )
}
