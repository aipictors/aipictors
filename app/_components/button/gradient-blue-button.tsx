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
 * @param props
 * @returns
 */
export function GradientBlueButton(props: Props) {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`flex h-10 font-medium hover:opacity-80 duration-200 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-fuchsia-500 dark:from-fuchsia-700 dark:to-fuchsia-800 p-1 text-white ${props.className}`}
    >
      <div
        className={
          // biome-ignore lint/nursery/useSortedClasses: <explanation>
          `flex h-8 flex-1 justify-center rounded-md py-2 ${
            props.isNoBackground ? "" : "bg-white"
          }`
        }
        style={{ WebkitTextStrokeColor: "#fff" }}
      >
        {props.children}
      </div>
    </button>
  )
}
