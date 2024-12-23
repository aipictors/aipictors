import { graphql } from "gql.tada"
import { cn } from "~/lib/utils"
import { DeleteStickerConfirmDialog } from "~/routes/($lang)._main.posts.$post._index/components/delete-sticker-confirm-dialog"

type Props = {
  imageUrl?: string
  title: string
  key: string
  onClick: () => void
  onDelete?: () => void
  size?: "2x-large" | "small" | "medium" | "large" | "x-large"
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
      case "2x-large":
        return "h-32 w-32 p-3"
      default:
        return "h-24 w-24 p-2" // デフォルトは x-large サイズ
    }
  })()

  return (
    <div className="relative">
      <button
        className={cn(
          "relative box-border rounded border-2 border-transparent transition duration-500 hover:border-2 hover:border-clear-bright-blue",
          sizeClasses,
        )}
        type={"button"}
        onClick={props.onClick}
      >
        <img className="m-auto" src={props.imageUrl} alt={props.title} />
      </button>
      {props.onDelete && (
        <DeleteStickerConfirmDialog onDelete={props.onDelete} />
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
