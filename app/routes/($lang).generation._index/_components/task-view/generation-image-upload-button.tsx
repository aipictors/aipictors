import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import { FileUp } from "lucide-react"
import { toast } from "sonner"

type Props = {
  disabled: boolean
  selectedTaskIds: string[]
  title?: string
  isEnable?: boolean
}

/**
 * 生成画像の投稿ボタン
 */
export function GenerationImagePostButton(props: Props) {
  const onClick = async () => {
    const url = `https://www.aipictors.com/post?generation=${props.selectedTaskIds.join(
      "%7C",
    )}`
    window.open(url, "_blank")
  }

  return props.isEnable ? (
    <Button
      onClick={() => {
        toast("投稿対象の履歴を選択してください。")
      }}
      title={props.title}
      disabled={props.disabled}
      variant={"ghost"}
      className={"w-12"}
    >
      <div className="mx-2 flex items-center">
        <FileUp className="w-4" />
        投稿
      </div>
    </Button>
  ) : (
    <AppConfirmDialog
      title={"投稿する"}
      description={"投稿サイトAipictorsに作品を投稿しますか？"}
      onNext={onClick}
      onCancel={() => {}}
      cookieKey={"generation_post"}
    >
      <Button
        title={props.title}
        disabled={props.disabled}
        variant="ghost"
        size="icon"
        onClick={() => {}}
        className={"w-12"}
      >
        <div className="mx-2 flex items-center">
          <FileUp className="w-4" />
          投稿
        </div>
      </Button>
    </AppConfirmDialog>
  )
}
