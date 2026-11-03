import {
  AwardIcon,
  ChevronRightIcon,
  CoinsIcon,
  HeartIcon,
  type LucideIcon,
  MailIcon,
  MessageCircleIcon,
  SettingsIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  CommentList,
  MessageList,
  NotificationList,
} from "~/routes/($lang)._main._index/components/home-notification-lists"
import {
  toBadgeText,
  type UnreadCounts,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"

export {
  MessageList,
  RowList,
  RowSkeletons,
} from "~/routes/($lang)._main._index/components/home-notification-lists"
export {
  type PanelItem,
  type PanelReply,
  type PanelSupport,
  TAB_WHERE,
  toPanelItems,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-items"
export { panelNotificationsQuery } from "~/routes/($lang)._main._index/components/home-notifications-panel-queries"

type PanelTab =
  | "ALL"
  | "COMMENT"
  | "LIKED"
  | "FOLLOW"
  | "AWARD"
  | "COIN"
  | "MESSAGE"

type Props = {
  /** パネルを開いた時点の未読の数 */
  unread: UnreadCounts
  onClose: () => void
}

/**
 * ベルのお知らせパネル
 */
export function HomeNotificationsPanel(props: Props) {
  const t = useTranslation()
  const [tab, setTab] = useState<PanelTab>("ALL")

  const commentUnread = props.unread.comment + props.unread.reply
  const tabs: {
    value: PanelTab
    label: string
    icon: LucideIcon
    count: number
  }[] = [
    {
      value: "ALL",
      label: t("すべて", "All"),
      icon: SparklesIcon,
      count:
        props.unread.liked +
        commentUnread +
        props.unread.follow +
        props.unread.award,
    },
    {
      value: "COMMENT",
      label: t("コメント", "Replies"),
      icon: MessageCircleIcon,
      count: commentUnread,
    },
    {
      value: "LIKED",
      label: t("いいね", "Likes"),
      icon: HeartIcon,
      count: props.unread.liked,
    },
    {
      value: "FOLLOW",
      label: t("フォロー", "Follow"),
      icon: UserRoundPlusIcon,
      count: props.unread.follow,
    },
    {
      value: "AWARD",
      label: t("入賞", "Awards"),
      icon: AwardIcon,
      count: props.unread.award,
    },
    {
      value: "COIN",
      label: t("コイン", "Coins"),
      icon: CoinsIcon,
      count: 0,
    },
    {
      value: "MESSAGE",
      label: t("運営", "Team"),
      icon: MailIcon,
      count: props.unread.message,
    },
  ]

  return (
    <div className="flex h-[min(72vh,600px)] flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="font-bold text-base">{t("お知らせ", "Notifications")}</p>
        <Link
          to="/settings/notification"
          onClick={props.onClose}
          aria-label={t("通知の設定", "Notification settings")}
          title={t("通知の設定", "Notification settings")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <SettingsIcon className="size-4" />
        </Link>
      </div>

      {/* 7 つを横スクロールにすると後ろが見切れて気づけないので、1 行に全部収める */}
      <div
        role="tablist"
        aria-label={t("お知らせの種類", "Notification type")}
        className="grid shrink-0 grid-cols-7 gap-0.5 border-b px-1.5 pb-2"
      >
        {tabs.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.value)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg px-0.5 py-1.5 font-medium text-[10px] leading-none transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-4" />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 left-2.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 font-bold text-[9px] text-white tabular-nums">
                    {toBadgeText(item.count)}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {props.unread.moderation > 0 && (
          <Link
            to="/my/reports"
            onClick={props.onClose}
            className="flex items-center gap-3 border-b bg-orange-500/10 px-4 py-3 transition-colors hover:bg-orange-500/15"
          >
            <ShieldAlertIcon className="size-5 shrink-0 text-orange-600 dark:text-orange-400" />
            <span className="min-w-0 flex-1 font-medium text-sm">
              {t(
                `運営からのお知らせが ${props.unread.moderation} 件あります`,
                `${props.unread.moderation} notices from the Aipictors team`,
              )}
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        )}
        {tab === "MESSAGE" ? (
          <MessageList unread={props.unread} onClose={props.onClose} />
        ) : tab === "COMMENT" ? (
          <CommentList unread={props.unread} onClose={props.onClose} />
        ) : (
          <NotificationList
            key={tab}
            tab={tab}
            unread={props.unread}
            onClose={props.onClose}
          />
        )}
      </div>

      <Link
        to="/notifications"
        onClick={props.onClose}
        className="flex shrink-0 items-center justify-center gap-1 border-t py-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
      >
        {t("通知の履歴をすべて見る", "See all notification history")}
        <ChevronRightIcon className="size-3.5" />
      </Link>
    </div>
  )
}
