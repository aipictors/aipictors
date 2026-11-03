import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { BellIcon } from "lucide-react"
import { useContext, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { AuthContext } from "~/contexts/auth-context"
import { HomeNotificationsPanel } from "~/routes/($lang)._main._index/components/home-notifications-panel"
import {
  EMPTY_UNREAD_COUNTS,
  toBadgeText,
  toUnreadTotal,
  type UnreadCounts,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"

type Props = {
  unreadCounts: UnreadCounts
  /** 確認済みにしたあとに未読の数を取り直す */
  onMarkedAsRead: () => void
}

/**
 * ヘッダーのお知らせメニュー。
 * 開いたらすべて確認済みにし、開いた時点の未読だけをパネルの中で目立たせる
 */
export function HomeNotificationsMenu(props: Props) {
  const authContext = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  const [unreadSnapshot, setUnreadSnapshot] =
    useState<UnreadCounts>(EMPTY_UNREAD_COUNTS)
  const [markAsRead] = useMutation(markNotificationsAsReadMutation)

  if (!authContext.isLoggedIn) {
    return null
  }

  const total = toUnreadTotal(props.unreadCounts)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) return
    setUnreadSnapshot(props.unreadCounts)
    if (total > 0) {
      void markAsRead()
        .then(props.onMarkedAsRead)
        .catch(() => {})
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={total > 0 ? `通知（未読 ${total} 件）` : "通知"}
          className="relative shrink-0 rounded-full"
        >
          <BellIcon className="size-5" />
          {total > 0 && (
            <span className="absolute top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-bold text-[10px] text-white tabular-nums ring-2 ring-background">
              {toBadgeText(total)}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        collisionPadding={8}
        sideOffset={8}
        className="w-[calc(100vw-1rem)] overflow-hidden rounded-2xl p-0 shadow-xl sm:w-[420px]"
      >
        {open && (
          <HomeNotificationsPanel
            unread={unreadSnapshot}
            onClose={() => setOpen(false)}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const markNotificationsAsReadMutation = graphql(
  `mutation MarkNotificationsAsRead {
    markNotificationsAsRead
  }`,
)
