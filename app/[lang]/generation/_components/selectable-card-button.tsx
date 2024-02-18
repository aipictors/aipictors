import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

type Props = {
  children: React.ReactNode
  /**
   * 選択されている
   */
  isSelected?: boolean
  onClick?(): void
}

export function SelectableCardButton(props: Props) {
  return (
    <button
      type={"button"}
      onClick={props.onClick}
      className={cn(
        "relative",
        "p-0 h-auto overflow-hidden rounded bg-card",
        "border-2 border-input",
        {
          "hover:opacity-80": !props.isSelected,
          "opacity-40": props.isSelected,
          "border-primary": props.isSelected,
        },
      )}
    >
      {props.children}
      {!props.isSelected ? null : (
        <div className="absolute bg-white rounded-full right-2 bottom-2">
          <CheckIcon color="black" />
        </div>
      )}
    </button>
  )
}
