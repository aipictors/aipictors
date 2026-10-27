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
export function GradientBlueButton (props: Props): React.ReactNode {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={cn(
        "flex h-10 rounded-lg bg-linear-to-tr from-fuchsia-600 to-fuchsia-500 p-1 font-medium text-white duration-200 hover:opacity-80 dark:from-fuchsia-700 dark:to-fuchsia-800",
        props.className,
      )}
    >
      <div
        className={cn(
          "flex h-full min-w-0 flex-1 items-center justify-center rounded-md",
          {
            "bg-white": !props.isNoBackground,
          },
        )}
        style={{ WebkitTextStrokeColor: "#fff" }}
      >
        {props.children}
      </div>
    </button>
  )
}
