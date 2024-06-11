import { GiftIcon } from "lucide-react"

type Props = {
  promptonId: string
  rounded?: "rounded" | "rounded-md" | "rounded-full"
  hideIcon?: boolean
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestColorfulButton = (props: Props) => {
  const onClick = () => {
    window.open(`https://prompton.io/aipic/${props.promptonId}`, "_blank")
  }

  return (
    <button
      onClick={onClick}
      // biome-ignore lint/a11y/useButtonType: <explanation>
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`flex w-full items-center ${props.rounded} bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 px-2 py-1 text-white shadow-lg focus:outline-none`}
    >
      <div className="m-auto flex items-center">
        {props.hideIcon !== true && (
          <span className="mr-2 rounded-full bg-white bg-opacity-30 p-1">
            <GiftIcon className="w-4" />
          </span>
        )}
        <span className="font-bold">チップを送る</span>
      </div>
    </button>
  )
}
