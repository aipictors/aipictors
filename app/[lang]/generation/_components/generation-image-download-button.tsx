import { downloadGeneratedImageFiles } from "@/app/[lang]/generation/_utils/download-generated-image-files"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { ArrowDownToLine, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
}

/**
 * 生成画像のZip形式のダウンロードボタン
 * @param props
 * @returns
 */
export function GenerationImageDownloadButton(props: Props) {
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

  return (
    <Button
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
