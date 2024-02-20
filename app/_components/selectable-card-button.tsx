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
  onClick?(): void
  /**
   * ホバーされている
   */
  onMouseEnter?(): void
  onMouseLeave?(): void
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
      onMouseEnter={() => {
        if (props.onMouseEnter) props.onMouseEnter()
      }}
      onMouseLeave={() => {
        if (props.onMouseLeave) props.onMouseLeave()
      }}
      className={cn(
        "relative",
        "p-0 h-auto overflow-hidden rounded bg-card",
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
      {!props.isSelected ? null : (
        <div className="absolute bg-white rounded-full right-2 bottom-2">
          <CheckIcon color="black" />
        </div>
      )}
    </button>
  )
}
