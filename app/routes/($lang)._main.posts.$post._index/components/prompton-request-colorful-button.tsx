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
          "inline-flex size-10 items-center justify-center shadow-sm focus:outline-hidden",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "md:bg-linear-to-r md:from-orange-400 md:via-pink-500 md:to-blue-500 md:text-white md:hover:opacity-95",
          props.rounded ?? "rounded-full",
        )}
      >
        <span className="font-medium text-[11px] leading-none">
          {t("支援", "Support")}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center justify-center gap-2 px-3 py-2 focus:outline-hidden",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "md:bg-linear-to-r md:from-orange-400 md:via-pink-500 md:to-blue-500 md:text-white md:hover:opacity-95",
        props.rounded,
      )}
    >
      <span className="font-medium text-sm">
        {t("サポートする", "Support")}
      </span>
    </button>
  )
}
