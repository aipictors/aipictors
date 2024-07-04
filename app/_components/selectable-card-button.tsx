import { cn } from "@/_lib/cn"
// import Theme from "@/routes/($lang)._main.themes.$year.$month.$day._index/route"
import { CheckIcon } from "lucide-react"

type Props = {
  /**
   * 画像など
   */
  children: React.ReactNode
  /**
   * 選択されている
   */
  isSelected?: boolean
  /**
   * 選択無効化
   */
  isDisabled: boolean
  onClick?(): void
}

/**
 * 選択可能なカード型ボタン
 */
export function SelectableCardButton(props: Props) {
  return (
    <button
      type={"button"}
      onClick={props.onClick}
      className={cn(
        "relative",
        "h-auto rounded bg-card p-0 p-2overflow-hidden",
        "border-2 border-input",
        {
          "hover:opacity-80": !props.isSelected,
          "border-primary": props.isSelected,
        },
      )}
    >
      <div
        className={cn({
          "opacity-40": props.isSelected,
        })}
      >
        {props.children}
      </div>
      {!props.isDisabled && (
        <div
          className={cn(
            "absolute top-2 right-2 rounded-full border-2 bg-foreground",
            {
              "border-2 border-black border-solid opacity-50":
                !props.isSelected,
            },
          )}
        >
          {props.isSelected ? (
            <CheckIcon className="p-1 text-background" />
          ) : (
            <CheckIcon className="p-1 opacity-0" />
          )}
        </div>
      )}
    </button>
  )
}
