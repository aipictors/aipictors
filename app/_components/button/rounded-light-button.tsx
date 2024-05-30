type Props = {
  children: React.ReactNode
  disabled?: boolean
  isActive?: boolean
  onClick(): void
}

/**
 * 角丸の淡い色のボタン
 * @param props
 * @returns
 */
export function RoundedLightButton(props: Props) {
  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={`flex items-center justify-center rounded-full p-1 pr-2 pl-4 duration-200 hover:opacity-80${
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        props.isActive ? " bg-zinc-100 dark:bg-zinc-800" : " bg-transparent"
      }`}
    >
      {props.children}
    </button>
  )
}
