type Props = {
  disabled?: boolean
  onClick(): void
  text?: string
}

/**
 * LINEログインボタン
 * @param props
 * @returns
 */
export function LineLoggedInButton(props: Props) {
  const buttonText = props.text || "LINEログイン"

  return (
    <button
      onClick={props.onClick}
      type="button"
      disabled={props.disabled}
      className={
        "flex w-full items-center rounded-md bg-line-theme font-bold duration-200 hover:opacity-90"
      }
    >
      <div className="m-auto flex items-center">
        <div className="pl-2">
          <img
            alt="line icon"
            className="h-8 w-8"
            src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/btn_base.png"
          />
        </div>
        <p className="p-4 pr-6 text-md text-white">{buttonText}</p>
      </div>
    </button>
  )
}
