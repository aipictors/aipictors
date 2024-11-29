import { Button } from "~/components/ui/button"
import { useGenerationContext } from "~/routes/($lang).generation.demonstration/hooks/use-generation-context"
import { downloadGeneratedImageFiles } from "~/routes/($lang).generation.demonstration/utils/download-generated-image-files"
import { useMutation } from "@tanstack/react-query"
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
  const context = useGenerationContext()

  const { status, mutateAsync } = useMutation({
    mutationFn: downloadGeneratedImageFiles,
    onError(error) {
      toast.error(error.message)
    },
    onSuccess() {
      toast.success("画像をダウンロードしました")
    },
  })

  const onClick = async () => {
    await mutateAsync(props.selectedTaskIds)
  }

  /**
   * 処理中
   */
  const isLoading = status === "pending"

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
