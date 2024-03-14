import { cn } from "@/lib/utils"
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
 * @param props
 * @returns
 */
export function SelectableCardButton(props: Props) {
  return (
    <button
      type={"button"}
      onClick={props.onClick}
      className={cn(
        "relative",
        "h-auto overflow-hidden rounded bg-card p-0",
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
          className={cn("absolute top-2 right-2 rounded-full bg-white", {
            "opacity-50 border-solid border-2 border-black": !props.isSelected,
          })}
        >
          <CheckIcon color={props.isSelected ? "black" : "white"} />
        </div>
      )}
    </button>
  )
}
