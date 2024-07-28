import { AuthContext } from "~/contexts/auth-context"
import { GiftIcon } from "lucide-react"
import { useContext } from "react"

type Props = {
  promptonId: string
  rounded?: "rounded" | "rounded-md" | "rounded-full"
  hideIcon?: boolean
  targetUserId: string
}

/**
 * 投稿者への支援ボタン
 */
export const PromptonRequestColorfulButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (authContext.userId === props.targetUserId) {
    return null
  }

  const onClick = () => {
    window.open(`https://prompton.io/aipic/${props.promptonId}`, "_blank")
  }

  return (
    <button
      onClick={onClick}
      // biome-ignore lint/a11y/useButtonType: <explanation>
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`flex w-full h-8 md:h-10 items-center ${props.rounded} bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 px-2 py-1 text-white shadow-lg focus:outline-none`}
    >
      <div className="m-auto flex items-center">
        {props.hideIcon !== true && (
          <span className="rounded-full bg-white bg-opacity-30 p-1">
            <GiftIcon className="h-4 w-4" />
          </span>
        )}
        <span className="font-bold">サポートする</span>
      </div>
    </button>
  )
}
