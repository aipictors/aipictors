import { ChevronRightIcon, GiftIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 置き場所（plus_invite_click の src） */
  source: string
  className?: string
}

/**
 * 紹介ページ（/invite）への 1 行の導線
 */
export function InviteLinkRow(props: Props) {
  const t = useTranslation()

  return (
    <Link
      to="/invite"
      onClick={() => trackGrowthEvent("plus_invite_click", props.source)}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 motion-reduce:transition-none",
        props.className,
      )}
    >
      <GiftIcon className="size-4 shrink-0 text-violet-500" />
      <span className="min-w-0 flex-1">
        {t(
          "友だちを招待するとフリーコインがもらえます",
          "Invite friends and earn free coins",
        )}
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
