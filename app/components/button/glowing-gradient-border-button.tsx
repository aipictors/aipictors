import { cn } from "~/lib/utils"

type Props = {
  /**
   * 画像など
   */
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick(): void
}

/**
 * ボーダーが光るグラデーションボタン
 */
export function GlowingGradientBorderButton (props: Props): React.ReactNode {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn("relative m-4 bg-gray-50 dark:bg-black", props.className)}
    >
      <div className="mx-auto max-w-7xl">
        <div className="group relative cursor-pointer">
          <div className="-inset-1 absolute rounded-lg bg-linear-to-r from-red-600 to-violet-600 opacity-25 blur-sm transition duration-1000 group-hover:opacity-90 group-hover:duration-200 dark:opacity-75" />
          <div className="items-top relative flex justify-center space-x-6 rounded-lg bg-white px-4 py-4 leading-none ring-1 ring-gray-900/5 dark:text-black">
            {props.children}
          </div>
        </div>
      </div>
    </button>
  )
}
