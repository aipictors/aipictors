type Props = {
  disabled?: boolean
  onClick(): void
  text?: string
  /** 前回使った方法の目印 */
  badge?: React.ReactNode
}

/**
 * LINEログインボタン
 */
export function LineLoggedInButton(props: Props): React.ReactNode {
  const buttonText = props.text || "LINEログイン"

  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className="relative flex h-12 w-full items-center justify-center rounded-xl bg-line-theme font-semibold text-sm text-white duration-200 hover:opacity-90 disabled:opacity-60"
    >
      <span className="absolute left-2.5">
        <img
          alt=""
          className="size-8"
          width={32}
          height={32}
          src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/btn_base.png"
        />
      </span>
      {buttonText}
      {props.badge && <span className="absolute right-3">{props.badge}</span>}
    </button>
  )
}
