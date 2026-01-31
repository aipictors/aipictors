import { Button } from "~/components/ui/button"
import { FileUp } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationImageUploadConfirmDialog } from "~/routes/($lang).generation._index/components/task-view/generation-image-upload-confirm-dialog"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
  title?: string
  isEnable?: boolean
}

/**
 * 生成画像の投稿ボタン
 */
export function GenerationImagePostButton (props: Props) {
  const t = useTranslation()

  const onClick = async () => {
    const url = `/new/image?generation=${props.selectedTaskIds.join("%7C")}`
    window.open(url, "_blank")
  }

  return props.isEnable ? (
    <Button
      onClick={() => {
        toast(
          t(
            "投稿対象の履歴を選択してください。",
            "Please select the history to post.",
          ),
        )
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      className={"w-12"}
    >
      <div className="mx-2 flex items-center">
        <FileUp className="w-4" />
        {t("投稿", "Post")}
      </div>
    </Button>
  ) : (
    <GenerationImageUploadConfirmDialog
      onClick={onClick}
      title={props.title ?? ""}
      disabled={props.disabled}
    />
  )
}
