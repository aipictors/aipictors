import { useQuery } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import {
  AwardIcon,
  ChevronRightIcon,
  CoinsIcon,
  HeartIcon,
  type LucideIcon,
  MailIcon,
  MessageCircleIcon,
  ReplyIcon,
  SettingsIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type NotificationPanelKind,
  type NotificationRow,
  type NotificationSection,
  toBadgeText,
  toNotificationRows,
  toNotificationSection,
  type UnreadCounts,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

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

type PanelUser = {
  id: string
  name: string
  iconUrl?: string | null
  isFollowee?: boolean
}

type PanelWork = {
  id: string
  title?: string | null
  smallThumbnailImageURL?: string | null
}

type PanelItem = {
  id: string
  kind: NotificationPanelKind
  createdAt: number
  workId: string | null
  work: PanelWork | null
  user: PanelUser | null
  message: string | null
  stickerUrl: string | null
  isNotReplied: boolean
}

const KIND_STYLES: Record<
  NotificationPanelKind,
  { icon: LucideIcon; className: string }
> = {
  liked: { icon: HeartIcon, className: "bg-rose-500" },
  comment: { icon: MessageCircleIcon, className: "bg-sky-500" },
  reply: { icon: ReplyIcon, className: "bg-indigo-500" },
  follow: { icon: UserRoundPlusIcon, className: "bg-emerald-500" },
  award: { icon: AwardIcon, className: "bg-amber-500" },
  coin: { icon: CoinsIcon, className: "bg-yellow-500" },
}

/** 通知ノード（種類で持っている項目が違う） */
type PanelNode = {
  __typename?: string
  id: string
  createdAt: number
  message?: string | null
  work?: PanelWork | null
  user?: PanelUser | null
  sticker?: { imageUrl?: string | null } | null
  myReplies?: { id: string }[] | null
}

const KIND_BY_TYPENAME: Record<string, NotificationPanelKind> = {
  LikedWorkNotificationNode: "liked",
  WorkCommentNotificationNode: "comment",
  WorkCommentReplyNotificationNode: "reply",
  FollowNotificationNode: "follow",
  WorkAwardNotificationNode: "award",
}

/** GraphQL の通知ノードを、パネルで扱う形にそろえる */
const toPanelItem = (node: PanelNode): PanelItem | null => {
  const nodeKind = KIND_BY_TYPENAME[node.__typename ?? ""]
  if (nodeKind === undefined) return null
  // コインのお知らせは作品のない入賞のノードで返ってくる
  const kind = nodeKind === "award" && !node.work ? "coin" : nodeKind
  if (kind === "liked" && !node.work) return null
  if (kind === "follow" && !node.user) return null
  return {
    id: node.id,
    kind,
    createdAt: node.createdAt,
    workId: node.work?.id ?? null,
    work: node.work ?? null,
    user: node.user ?? null,
    message: node.message ?? null,
    stickerUrl: node.sticker?.imageUrl ?? null,
    isNotReplied: kind === "comment" && (node.myReplies?.length ?? 0) === 0,
  }
}

const toPanelItems = (nodes: unknown): PanelItem[] =>
  ((nodes ?? []) as PanelNode[])
    .map(toPanelItem)
    .filter((item) => item !== null)
    .sort((a, b) => b.createdAt - a.createdAt)

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

const TAB_WHERE = {
  ALL: { excludeCoin: true },
  COMMENT: { type: "WORK_COMMENT" },
  REPLY: { type: "COMMENT_REPLY" },
  LIKED: { type: "LIKED_WORK" },
  FOLLOW: { type: "FOLLOW" },
  AWARD: { type: "WORK_AWARD" },
  COIN: { type: "LIKED_WORKS_SUMMARY" },
} as const

function NotificationList(props: {
  tab: keyof typeof TAB_WHERE
  unread: UnreadCounts
  onClose: () => void
}) {
  const { data, loading } = useQuery(panelNotificationsQuery, {
    variables: { limit: 40, where: TAB_WHERE[props.tab] },
    fetchPolicy: "cache-and-network",
  })

  const items = useMemo(() => toPanelItems(data?.viewer?.notifications), [data])

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
function CommentList(props: { unread: UnreadCounts; onClose: () => void }) {
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

function RowList(props: {
  items: PanelItem[]
  isLoading: boolean
  unread: UnreadCounts
  onClose: () => void
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
        text={t("まだお知らせはありません", "No notifications yet")}
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
            <NotificationRowView row={row} onClose={props.onClose} />
          </div>
        )
      })}
    </div>
  )
}

const toRowHref = (item: PanelItem) => {
  if (item.kind === "follow") {
    return item.user ? `/users/${item.user.id}` : null
  }
  if (item.kind === "coin") {
    return item.message?.startsWith("🏅") ? "/achievements" : null
  }
  return item.work ? `/posts/${item.work.id}` : null
}

function NotificationRowView(props: {
  row: NotificationRow<PanelItem>
  onClose: () => void
}) {
  const t = useTranslation()
  const { item, group, isUnread } = props.row
  const href = toRowHref(item)

  const body = (
    <>
      {isUnread && (
        <span
          title={t("未読", "Unread")}
          className="-translate-y-1/2 absolute top-1/2 left-1.5 size-1.5 rounded-full bg-sky-500"
        />
      )}
      <RowLeading item={item} group={group} />
      <div className="min-w-0 flex-1 space-y-1">
        <RowTitle item={item} group={group} />
        {item.kind === "liked" && item.work?.title && (
          <p className="truncate text-muted-foreground text-xs">
            {t(item.work.title, item.work.enTitle || undefined)}
          </p>
        )}
        {item.message && item.kind !== "award" && item.kind !== "coin" && (
          <p className="line-clamp-2 whitespace-pre-line break-words text-muted-foreground text-xs leading-relaxed">
            {item.message}
          </p>
        )}
        {item.stickerUrl && (
          <img
            src={item.stickerUrl}
            alt={t("スタンプ", "Sticker")}
            loading="lazy"
            className="size-12 rounded-md object-cover"
          />
        )}
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {t(
            toElapsedTimeText(item.createdAt),
            toElapsedTimeEnText(item.createdAt),
          )}
          {item.kind === "reply" && (
            <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.5 font-medium text-indigo-700 dark:text-indigo-300">
              {t("返信", "Reply")}
            </span>
          )}
          {item.isNotReplied && (
            <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 font-medium text-sky-700 dark:text-sky-300">
              {t("未返信", "Not replied")}
            </span>
          )}
        </p>
      </div>
      {item.work?.smallThumbnailImageURL && (
        <img
          src={item.work.smallThumbnailImageURL}
          alt={t(item.work.title, item.work.enTitle || undefined) ?? ""}
          loading="lazy"
          className="size-11 shrink-0 rounded-lg object-cover"
        />
      )}
    </>
  )

  const rowClassName = cn(
    "relative flex items-start gap-3 px-4 py-2.5 transition-colors",
    isUnread && "bg-sky-500/10",
  )

  if (item.kind === "follow" && item.user) {
    return (
      <div className={cn(rowClassName, "items-center hover:bg-muted/60")}>
        <Link
          to={`/users/${item.user.id}`}
          onClick={props.onClose}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          {body}
        </Link>
        {!item.user.isFollowee && (
          <div className="w-24 shrink-0">
            <FollowButton
              targetUserId={item.user.id}
              targetUserName={item.user.name}
              isFollow={false}
              isFollower={true}
              className="h-7 text-xs"
            />
          </div>
        )}
      </div>
    )
  }

  if (href === null) {
    return <div className={rowClassName}>{body}</div>
  }

  return (
    <Link
      to={href}
      onClick={props.onClose}
      className={cn(rowClassName, "hover:bg-muted/60")}
    >
      {body}
    </Link>
  )
}

function RowLeading(props: { item: PanelItem; group: PanelItem[] }) {
  const style = KIND_STYLES[props.item.kind]
  const Icon = style.icon
  const users = props.group
    .map((item) => item.user)
    .filter((user) => user !== null)
    .slice(0, 1)

  if (users.length === 0) {
    return (
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-white",
          style.className,
        )}
      >
        <Icon className="size-5" />
      </span>
    )
  }

  return (
    <span className="relative size-10 shrink-0">
      <Avatar className="size-10">
        <AvatarImage
          src={withIconUrlFallback(users[0]?.iconUrl)}
          alt=""
          className="object-cover"
        />
        <AvatarFallback />
      </Avatar>
      <span
        className={cn(
          "-right-0.5 -bottom-0.5 absolute flex size-[18px] items-center justify-center rounded-full text-white ring-2 ring-popover",
          style.className,
        )}
      >
        <Icon className="size-2.5" />
      </span>
    </span>
  )
}

function RowTitle(props: { item: PanelItem; group: PanelItem[] }) {
  const t = useTranslation()
  const { item, group } = props
  const name = (
    <span className="font-semibold">
      {item.user?.name ?? t("匿名のユーザー", "Someone")}
    </span>
  )
  const others = group.length - 1

  const className = "break-words text-sm leading-snug"

  switch (item.kind) {
    case "liked":
      return (
        <p className={className}>
          {name}
          {others > 0
            ? t(
                `さんほか${others}人が作品にいいねしました`,
                ` and ${others} others liked your work`,
              )
            : t("さんが作品にいいねしました", " liked your work")}
        </p>
      )
    case "comment":
      return (
        <p className={className}>
          {name}
          {t("さんが作品にコメントしました", " commented on your work")}
        </p>
      )
    case "reply":
      return (
        <p className={className}>
          {name}
          {t("さんがコメントに返信しました", " replied to a comment")}
        </p>
      )
    case "follow":
      return (
        <p className={className}>
          {name}
          {t("さんにフォローされました", " followed you")}
        </p>
      )
    default:
      return <p className={className}>{item.message}</p>
  }
}

function MessageList(props: { unread: UnreadCounts; onClose: () => void }) {
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

function RowSkeletons() {
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

const PanelLikedFragment = graphql(
  `fragment PanelLiked on LikedWorkNotificationNode @_unmask {
    id
    createdAt
    work { id title smallThumbnailImageURL }
    user { id name iconUrl }
  }`,
)

const PanelCommentFragment = graphql(
  `fragment PanelComment on WorkCommentNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title smallThumbnailImageURL }
    user { id name iconUrl }
    sticker { id imageUrl }
    myReplies { id }
  }`,
)

const PanelReplyFragment = graphql(
  `fragment PanelReply on WorkCommentReplyNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title smallThumbnailImageURL }
    user { id name iconUrl }
    sticker { id imageUrl }
  }`,
)

const PanelFollowFragment = graphql(
  `fragment PanelFollow on FollowNotificationNode @_unmask {
    id
    createdAt
    user { id name iconUrl isFollowee }
  }`,
)

const PanelAwardFragment = graphql(
  `fragment PanelAward on WorkAwardNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title smallThumbnailImageURL }
  }`,
)

const panelNotificationsQuery = graphql(
  `query PanelNotifications($limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
      notifications(offset: 0, limit: $limit, where: $where) {
        __typename
        ... on LikedWorkNotificationNode { ...PanelLiked }
        ... on WorkCommentNotificationNode { ...PanelComment }
        ... on WorkCommentReplyNotificationNode { ...PanelReply }
        ... on FollowNotificationNode { ...PanelFollow }
        ... on WorkAwardNotificationNode { ...PanelAward }
      }
    }
  }`,
  [
    PanelLikedFragment,
    PanelCommentFragment,
    PanelReplyFragment,
    PanelFollowFragment,
    PanelAwardFragment,
  ],
)

const panelMessagesQuery = graphql(
  `query PanelMessages($limit: Int!) {
    viewer {
      id
      supportMessages(offset: 0, limit: $limit) {
        id
        text
        createdAt
        user { id iconUrl }
      }
    }
  }`,
)
