import { cn } from "~/lib/utils"

type Props = {
  /**
   * 画像など
   */
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
  disabled?: boolean
  isNoBackground?: boolean
  onClick(): void
}

/**
 * 青グラデボタン
 */
export function GradientBlueButton(props: Props) {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={cn(
        "flex h-10 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-fuchsia-500 p-1 font-medium text-white duration-200 hover:opacity-80 dark:from-fuchsia-700 dark:to-fuchsia-800",
        props.className,
      )}
    >
      <div
        className={cn("flex h-8 flex-1 justify-center rounded-md py-2", {
          "bg-white": !props.isNoBackground,
        })}
        style={{ WebkitTextStrokeColor: "#fff" }}
      >
        {props.children}
      </div>
    </button>
  )
}
