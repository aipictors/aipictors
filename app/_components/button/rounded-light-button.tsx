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
      className={`flex items-center justify-center rounded-full p-1 pl-2 text-sm duration-200 hover:opacity-80${
        props.isActive ? " bg-monotone-200" : " bg-transparent"
      }`}
    >
      {props.children}
    </button>
  )
}
