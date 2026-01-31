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
 * ボーダーが虹色のボタン
 */
export function GradientBorderButton (props: Props): React.ReactNode {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={cn(
        "flex h-10 items-center rounded-lg bg-linear-to-tr from-pink-300 to-blue-300 p-1 font-medium duration-200 hover:opacity-80 dark:text-black",
        props.className,
      )}
    >
      <div
        className={cn(
          "flex h-8 flex-1 items-center justify-center rounded-md py-2",
          { "bg-white": !props.isNoBackground },
        )}
        style={{ WebkitTextStrokeColor: "#fff" }}
      >
        {props.children}
      </div>
    </button>
  )
}
