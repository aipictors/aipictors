import { cn } from "~/lib/utils"
// import Theme from "~/routes/($lang)._main.themes.$year.$month.$day._index/route"
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
  /** ボタンの大きさを決めるとき（枠いっぱいに広げるなど） */
  className?: string
  /** 中身の大きさを決めるとき */
  contentClassName?: string
  onClick?(): void
}

/**
 * 選択可能なカード型ボタン
 */
export function SelectableCardButton (props: Props): React.ReactNode {
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
        props.className,
      )}
    >
      <div
        className={cn(
          {
            "opacity-40": props.isSelected,
          },
          props.contentClassName,
        )}
      >
        {props.children}
      </div>
      {!props.isDisabled && (
        <div
          className={cn(
            "absolute top-2 right-2 rounded-full border-2 bg-black dark:bg-white",
            {
              "border-2 border-black border-solid opacity-50":
                !props.isSelected,
            },
          )}
        >
          {props.isSelected ? (
            <CheckIcon className="p-1 text-white dark:text-black" />
          ) : (
            <CheckIcon className="p-1 opacity-0" />
          )}
        </div>
      )}
    </button>
  )
}
