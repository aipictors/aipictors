import { graphql } from "gql.tada"
import { LockIcon, PinIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { DeleteStickerConfirmDialog } from "~/routes/($lang)._main.posts.$post._index/components/delete-sticker-confirm-dialog"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type Props = {
  imageUrl?: string
  title: string
  key: string
  onClick: () => void
  onDelete?: () => void
  size?: "2x-large" | "small" | "medium" | "large" | "x-large"
  disabled?: boolean
  isPinned?: boolean
  /** 作者が非公開にしたなどで使えない（押せるが、薄くして印を付ける） */
  isUnusable?: boolean
}

/**
 * スタンプボタン
 */
export function StickerButton(props: Props) {
  const t = useTranslation()

  if (!props.imageUrl) {
    return null
  }

  // サイズに応じたクラスを決定
  const sizeClasses = (() => {
    switch (props.size) {
      case "small":
        return "size-8 p-1"
      case "medium":
        return "size-12 p-2"
      case "large":
        return "size-16 p-3"
      case "x-large":
        return "size-24 p-3"
      case "2x-large":
        return "size-32 p-3"
      default:
        return "size-24 p-2" // デフォルトは x-large サイズ
    }
  })()

  return (
    <div className="relative">
      <button
        className={cn(
          "relative box-border rounded border-2 border-transparent transition duration-500 hover:border-2 hover:border-clear-bright-blue",
          sizeClasses,
          {
            "cursor-not-allowed opacity-50": props.disabled,
          },
        )}
        type={"button"}
        onClick={props.disabled ? undefined : props.onClick}
        disabled={props.disabled}
        title={
          props.isUnusable
            ? t(
                "作者が非公開にしたため使えません",
                "Unavailable: the creator made it private",
              )
            : undefined
        }
      >
        <img
          className={cn("m-auto", props.isUnusable && "opacity-35 grayscale")}
          src={toResizedImageUrl(props.imageUrl, 240)}
          alt={props.title}
          loading="lazy"
          decoding="async"
        />
      </button>
      {props.isPinned && (
        <span className="pointer-events-none absolute top-1 left-1 rounded-full bg-primary p-1 text-primary-foreground">
          <PinIcon className="size-3" />
        </span>
      )}
      {props.isUnusable && (
        <span className="pointer-events-none absolute right-1 bottom-1 flex items-center gap-0.5 rounded-full bg-background/90 px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground shadow-sm">
          <LockIcon className="size-2.5" />
          {props.size !== "small" &&
            props.size !== "medium" &&
            props.size !== "large" &&
            t("使えません", "Unavailable")}
        </span>
      )}
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
    isUsable
  }`,
)
