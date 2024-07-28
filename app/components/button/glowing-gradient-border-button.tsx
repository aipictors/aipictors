type Props = {
  /**
   * 画像など
   */
  children: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon" | null | undefined
  disabled?: boolean
  onClick(): void
}

/**
 * ボーダーが光るグラデーションボタン
 */
export function GlowingGradientBorderButton(props: Props) {
  return (
    <button
      type={"button"}
      onClick={props.onClick}
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={` bg-gray-50 dark:bg-black m-4 relative ${props.className}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="group relative cursor-pointer">
          <div className="-inset-1 absolute rounded-lg bg-gradient-to-r from-red-600 to-violet-600 opacity-25 blur transition duration-1000 group-hover:opacity-90 group-hover:duration-200 dark:opacity-75" />
          <div className="items-top relative flex justify-center space-x-6 rounded-lg bg-white px-4 py-4 leading-none ring-1 ring-gray-900/5 dark:text-black">
            {props.children}
          </div>
        </div>
      </div>
    </button>
  )
}
