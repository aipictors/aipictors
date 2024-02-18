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
        "p-0 h-auto overflow-hidden rounded",
        "bg-gray-300 hover:bg-gray-300 border-solid",
        "dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80",
        "border-2 border-gray",
        {
          "opacity-40": props.isSelected,
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
