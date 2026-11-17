import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { toLikedUserEntries } from "~/routes/($lang)._main._index/components/home-notification-liked-users-utils"
import type { PanelItem } from "~/routes/($lang)._main._index/components/home-notifications-panel-items"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * まとめたいいねの通知（「◯◯さんほか◯人が作品にいいねしました」）の下に出す折りたたみ。
 * 開くと、いいねした人を新しい順に並べる（作品ページのハートを押さなくても分かるように）
 */
export function NotificationLikedUsers(props: {
  group: PanelItem[]
  onClose: () => void
}) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const entries = toLikedUserEntries(props.group)

  if (entries.length < 2) {
    return null
  }

  return (
    <div className="pr-4 pb-2 pl-[4.25rem]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full py-1 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
      >
        {open
          ? t("閉じる", "Hide")
          : t(
              `いいねした人を見る（${entries.length}人）`,
              `See who liked (${entries.length})`,
            )}
        <ChevronDownIcon
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {entries.map((entry) => {
            const content = (
              <>
                <Avatar className="size-7">
                  <AvatarImage
                    src={withIconUrlFallback(entry.user?.iconUrl)}
                    alt=""
                    className="object-cover"
                  />
                  <AvatarFallback />
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {entry.user?.name ?? t("匿名のユーザー", "Someone")}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {t(
                    toElapsedTimeText(entry.createdAt),
                    toElapsedTimeEnText(entry.createdAt),
                  )}
                </span>
              </>
            )
            const className =
              "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
            return (
              <li key={entry.id}>
                {entry.user ? (
                  <Link
                    to={`/users/${entry.user.id}`}
                    onClick={props.onClose}
                    className={cn(className, "hover:bg-muted/60")}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={className}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
