type Props = {
  children: React.ReactNode
  disabled?: boolean
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
      className={
        "flex items-center justify-center rounded-md bg-zinc-100 p-1 pl-2 duration-200 dark:bg-zinc-800 hover:opacity-80"
      }
    >
      {props.children}
    </button>
  )
}
