type Props = {
  imageUrl?: string
  title: string
  key: string
  onClick: () => void
}

/**
 * スタンプボタン
 */
export const StickerButton = (props: Props) => {
  if (!props.imageUrl) {
    return null
  }

  return (
    <button
      className="box-border rounded border-2 border-transparent p-1 transition duration-500 hover:border-2 hover:border-clear-bright-blue"
      key={props.key}
      type={"button"}
      onClick={props.onClick}
    >
      <img
        className="m-auto h-24 w-24"
        src={props.imageUrl}
        alt={props.title}
      />
    </button>
  )
}
