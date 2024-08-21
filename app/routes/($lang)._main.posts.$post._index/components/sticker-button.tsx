import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import { XIcon } from "lucide-react"
import { graphql } from "gql.tada"

type Props = {
  imageUrl?: string
  title: string
  key: string
  onClick: () => void
  onDelete?: () => void
  size?: "small" | "medium" | "large" | "x-large"
}

/**
 * スタンプボタン
 */
export function StickerButton(props: Props) {
  if (!props.imageUrl) {
    return null
  }

  // サイズに応じたクラスを決定
  const sizeClasses = (() => {
    switch (props.size) {
      case "small":
        return "h-8 w-8 p-1"
      case "medium":
        return "h-12 w-12 p-2"
      case "large":
        return "h-16 w-16 p-3"
      case "x-large":
        return "h-24 w-24 p-3"
      default:
        return "h-24 w-24 p-2" // デフォルトは x-large サイズ
    }
  })()

  return (
    <div className="relative">
      <button
        className={`relative box-border rounded border-2 border-transparent transition duration-500 hover:border-2 hover:border-clear-bright-blue ${sizeClasses}`}
        type={"button"}
        onClick={props.onClick}
      >
        <img className="m-auto" src={props.imageUrl} alt={props.title} />
      </button>
      {props.onDelete && (
        <AppConfirmDialog
          description="スタンプを削除しますか？"
          onNext={props.onDelete}
          onCancel={() => {}}
        >
          <Button
            variant={"secondary"}
            size={"icon"}
            className="absolute top-1 right-1 rounded-full"
            onClick={() => {}}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </AppConfirmDialog>
      )}
    </div>
  )
}

export const StickerButtonFragment = graphql(
  `fragment StickerButton on StickerNode @_unmask {
    id
    title
    imageUrl
  }`,
)
