import { cn } from "~/lib/utils"

type Props = {
  children: React.ReactNode
  disabled?: boolean
  isActive?: boolean
  onClick(): void
}

/**
 * 角丸の淡い色のボタン
 */
export function RoundedLightButton(props: Props) {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={cn(
        "flex items-center justify-center rounded-full p-1 pl-2 text-sm duration-200 hover:opacity-80",
        {
          "bg-zinc-100 dark:bg-zinc-800": props.isActive,
          "bg-transparent": !props.isActive,
        },
      )}
    >
      {props.children}
    </button>
  )
}
