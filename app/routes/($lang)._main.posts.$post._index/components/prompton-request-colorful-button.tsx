import { GiftIcon } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  promptonId: string
  rounded?: "rounded" | "rounded-md" | "rounded-full"
  hideIcon?: boolean
  variant?: "full" | "icon"
  targetUserId: string
}

/**
 * 投稿者への支援ボタン (Support Button for the Poster)
 */
export function PromptonRequestColorfulButton(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  if (authContext.userId === props.targetUserId) {
    return null
  }

  const onClick = () => {
    window.open(`https://prompton.io/aipic/${props.promptonId}`, "_blank")
  }

  const variant = props.variant ?? "full"

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={t("サポートする", "Support")}
        title={t("サポートする", "Support")}
        className={cn(
          "inline-flex size-10 items-center justify-center bg-linear-to-r from-orange-400 via-pink-500 to-blue-500 text-white shadow-sm focus:outline-hidden",
          props.rounded ?? "rounded-full",
        )}
      >
        <GiftIcon className="size-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-full items-center bg-linear-to-r from-orange-400 via-pink-500 to-blue-500 px-2 py-1 text-white focus:outline-hidden md:h-10",
        props.rounded,
      )}
    >
      <div className="m-auto flex items-center">
        {props.hideIcon !== true && (
          <span className="rounded-full bg-white bg-opacity-30 p-1">
            <GiftIcon className="size-4" />
          </span>
        )}
        <span className="font-bold">{t("サポートする", "Support")}</span>
      </div>
    </button>
  )
}
