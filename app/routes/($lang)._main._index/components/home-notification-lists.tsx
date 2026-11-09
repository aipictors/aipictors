import { useQuery } from "@apollo/client/index"
import { FeedLoadError } from "~/components/feed-load-error"
import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { NotificationRowView } from "~/routes/($lang)._main._index/components/home-notification-row"
import {
  type PanelItem,
  TAB_WHERE,
  toPanelItems,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-items"
import {
  panelMessagesQuery,
  panelNotificationsQuery,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-queries"
import {
  type NotificationSection,
  toBadgeText,
  toNotificationRows,
  toNotificationSection,
  type UnreadCounts,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export function NotificationList(props: {
  tab: keyof typeof TAB_WHERE
  unread: UnreadCounts
  onClose: () => void
}) {
  const { data, loading, error, refetch } = useQuery(panelNotificationsQuery, {
    variables: { offset: 0, limit: 40, where: TAB_WHERE[props.tab] },
    fetchPolicy: "cache-and-network",
  })

  const items = useMemo(() => toPanelItems(data?.viewer?.notifications), [data])

  if (items.length === 0 && !loading && error !== undefined) {
    return <FeedLoadError onRetry={() => refetch()} />
  }

  return (
    <RowList
      items={items}
      isLoading={loading && data === undefined}
      unread={props.unread}
      onClose={props.onClose}
    />
  )
}

/** コメントと返信は混ぜず、切り替えて見る（返信だけ未読なら返信から開く） */
export function CommentList(props: {
  unread: UnreadCounts
  onClose: () => void
}) {
  const t = useTranslation()
  const [kind, setKind] = useState<"COMMENT" | "REPLY">(
    props.unread.comment === 0 && props.unread.reply > 0 ? "REPLY" : "COMMENT",
  )
  const items = [
    {
      value: "COMMENT" as const,
      label: t("作品へのコメント", "On your works"),
      count: props.unread.comment,
    },
    {
      value: "REPLY" as const,
      label: t("返信", "Replies"),
      count: props.unread.reply,
    },
  ]

  return (
    <>
      <div className="sticky top-0 z-10 flex gap-1 border-b bg-popover p-2">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={kind === item.value}
            onClick={() => setKind(item.value)}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg font-medium text-xs transition-colors",
              kind === item.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-bold text-[10px] text-white tabular-nums">
                {toBadgeText(item.count)}
              </span>
            )}
          </button>
        ))}
      </div>
      <NotificationList
        key={kind}
        tab={kind}
        unread={props.unread}
        onClose={props.onClose}
      />
    </>
  )
}

export function RowList(props: {
  items: PanelItem[]
  isLoading: boolean
  unread: UnreadCounts
  onClose: () => void
  /** 通知ページ用: 本文を省略せず、スタンプとサムネイルを大きく */
  isExpanded?: boolean
  /** 行の下に出すもの（通知ページの返信欄） */
  renderFooter?: (item: PanelItem) => React.ReactNode
  emptyText?: string
}) {
  const t = useTranslation()

  const sectionLabels: Record<NotificationSection, string> = {
    today: t("今日", "Today"),
    yesterday: t("昨日", "Yesterday"),
    week: t("この1週間", "This week"),
    older: t("それ以前", "Earlier"),
  }

  const rows = useMemo(
    () => toNotificationRows(props.items, props.unread),
    [props.items, props.unread],
  )

  if (props.isLoading) {
    return <RowSkeletons />
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        text={
          props.emptyText ??
          t("まだお知らせはありません", "No notifications yet")
        }
      />
    )
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  let currentSection: NotificationSection | null = null

  return (
    <div className="pb-1">
      {rows.map((row) => {
        const section = toNotificationSection(row.item.createdAt, nowSeconds)
        const isNewSection = section !== currentSection
        currentSection = section
        return (
          <div key={row.id}>
            {isNewSection && (
              <p className="px-4 pt-3 pb-1 font-semibold text-muted-foreground text-xs">
                {sectionLabels[section]}
              </p>
            )}
            <NotificationRowView
              row={row}
              onClose={props.onClose}
              isExpanded={props.isExpanded}
              footer={props.renderFooter?.(row.item)}
            />
          </div>
        )
      })}
    </div>
  )
}

export function MessageList(props: {
  unread: UnreadCounts
  onClose: () => void
}) {
  const t = useTranslation()
  const { data, loading } = useQuery(panelMessagesQuery, {
    variables: { limit: 20 },
    fetchPolicy: "cache-and-network",
  })

  const messages = (data?.viewer?.supportMessages ?? []) as {
    id: string
    text: string
    createdAt: number
    user: { iconUrl?: string | null }
  }[]

  if (loading && data === undefined) {
    return <RowSkeletons />
  }

  if (messages.length === 0) {
    return (
      <EmptyState text={t("まだメッセージはありません", "No messages yet")} />
    )
  }

  return (
    <div className="py-1">
      {messages.map((message, index) => (
        <Link
          // 運営からのメッセージは、お問い合わせの画面で全文を出して AI に質問できる
          to={`/support/chat?letter=${message.id}`}
          key={message.id}
          onClick={props.onClose}
          className={cn(
            "relative flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60",
            index < props.unread.message && "bg-sky-500/10",
          )}
        >
          {index < props.unread.message && (
            <span className="-translate-y-1/2 absolute top-1/2 left-1.5 size-1.5 rounded-full bg-sky-500" />
          )}
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={withIconUrlFallback(message.user.iconUrl)}
              alt=""
              className="object-cover"
            />
            <AvatarFallback />
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="line-clamp-3 whitespace-pre-line break-words text-sm leading-snug">
              {message.text}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t(
                toElapsedTimeText(message.createdAt),
                toElapsedTimeEnText(message.createdAt),
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function RowSkeletons() {
  return (
    <div aria-hidden className="space-y-1 py-2">
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-2.5">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="size-11 shrink-0 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState(props: { text: string }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
      <img
        alt=""
        className="w-24 opacity-90"
        src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-sorry-image.png"
      />
      <p className="text-muted-foreground text-sm">{props.text}</p>
    </div>
  )
}
