import { useApolloClient, useMutation, useQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  AwardIcon,
  CheckIcon,
  ChevronRightIcon,
  CoinsIcon,
  HeartIcon,
  Loader2Icon,
  type LucideIcon,
  MailIcon,
  MessageCircleIcon,
  ReplyIcon,
  SendIcon,
  SettingsIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  MessageList,
  type PanelItem,
  panelNotificationsQuery,
  RowList,
  RowSkeletons,
  TAB_WHERE,
  toPanelItems,
} from "~/routes/($lang)._main._index/components/home-notifications-panel"
import {
  EMPTY_UNREAD_COUNTS,
  toBadgeText,
  type UnreadCounts,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"

const PAGE_SIZE = 40

/** サーバーが読める位置の上限 */
const MAX_OFFSET = 1024

type Tab =
  | "ALL"
  | "WORK_COMMENT"
  | "COMMENT_REPLY"
  | "LIKED_WORK"
  | "FOLLOW"
  | "WORK_AWARD"
  | "COIN"
  | "MESSAGE"

const TAB_VALUES: Tab[] = [
  "ALL",
  "WORK_COMMENT",
  "COMMENT_REPLY",
  "LIKED_WORK",
  "FOLLOW",
  "WORK_AWARD",
  "COIN",
  "MESSAGE",
]

/** 以前の URL（?type=LIKED_WORKS_SUMMARY）も開けるように */
const toTab = (value: string | null): Tab => {
  if (value === "LIKED_WORKS_SUMMARY") return "COIN"
  return TAB_VALUES.find((tab) => tab === value) ?? "ALL"
}

const TAB_TO_WHERE: Record<
  Exclude<Tab, "MESSAGE">,
  keyof typeof TAB_WHERE
> = {
  ALL: "ALL",
  WORK_COMMENT: "COMMENT",
  COMMENT_REPLY: "REPLY",
  LIKED_WORK: "LIKED",
  FOLLOW: "FOLLOW",
  WORK_AWARD: "AWARD",
  COIN: "COIN",
}

type ReplyFilter = "all" | "notReplied" | "replied"

/**
 * 通知の履歴
 */
export function NotificationListContents() {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = toTab(searchParams.get("type"))
  const replyFilter: ReplyFilter =
    searchParams.get("reply") === "not"
      ? "notReplied"
      : searchParams.get("reply") === "done"
        ? "replied"
        : "all"

  // 開いた時点の未読を覚えてから既読にする（一覧の未読の色はこの数で付ける）
  const [unread, setUnread] = useState<UnreadCounts | null>(null)
  const { data: unreadData } = useQuery(unreadCountsQuery, {
    fetchPolicy: "network-only",
  })
  const [markAsRead] = useMutation(markNotificationsAsReadMutation, {
    refetchQueries: ["ViewerUnreadNotificationCounts"],
  })

  const counts = unreadData?.viewer?.unreadNotificationCounts
  useEffect(() => {
    if (counts === undefined || unread !== null) return
    setUnread(counts)
    const total = Object.values(counts).reduce<number>(
      (sum, value) => sum + (typeof value === "number" ? value : 0),
      0,
    )
    if (total > 0) {
      void markAsRead().catch(() => {})
    }
  }, [counts, unread, markAsRead])

  const unreadCounts = unread ?? EMPTY_UNREAD_COUNTS

  const tabs: {
    value: Tab
    label: string
    icon: LucideIcon
    count: number
  }[] = [
    {
      value: "ALL",
      label: t("すべて", "All"),
      icon: SparklesIcon,
      count:
        unreadCounts.liked +
        unreadCounts.comment +
        unreadCounts.reply +
        unreadCounts.follow +
        unreadCounts.award,
    },
    {
      value: "WORK_COMMENT",
      label: t("コメント", "Comments"),
      icon: MessageCircleIcon,
      count: unreadCounts.comment,
    },
    {
      value: "COMMENT_REPLY",
      label: t("返信", "Replies"),
      icon: ReplyIcon,
      count: unreadCounts.reply,
    },
    {
      value: "LIKED_WORK",
      label: t("いいね", "Likes"),
      icon: HeartIcon,
      count: unreadCounts.liked,
    },
    {
      value: "FOLLOW",
      label: t("フォロー", "Follows"),
      icon: UserRoundPlusIcon,
      count: unreadCounts.follow,
    },
    {
      value: "WORK_AWARD",
      label: t("入賞", "Awards"),
      icon: AwardIcon,
      count: unreadCounts.award,
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
      count: unreadCounts.message,
    },
  ]

  const onChangeTab = (value: Tab) => {
    const next = new URLSearchParams()
    if (value !== "ALL") next.set("type", value)
    setSearchParams(next, { preventScrollReset: true })
    // 下にいたままだと、切り替えた一覧を今の位置まで読み続けてしまう
    window.scrollTo({ top: 0 })
  }

  const onChangeReplyFilter = (value: ReplyFilter) => {
    const next = new URLSearchParams(searchParams)
    next.delete("reply")
    if (value === "notReplied") next.set("reply", "not")
    if (value === "replied") next.set("reply", "done")
    setSearchParams(next, { preventScrollReset: true })
    window.scrollTo({ top: 0 })
  }

  const totalUnread = tabs[0].count + unreadCounts.message

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pt-2 pb-24">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-bold text-2xl">{t("お知らせ", "Notifications")}</h1>
          <p className="text-muted-foreground text-sm">
            {totalUnread > 0
              ? t(
                  `開いたときの未読 ${totalUnread} 件に色が付いています`,
                  `${totalUnread} new since your last visit are highlighted`,
                )
              : t("新しいお知らせはありません", "You're all caught up")}
          </p>
        </div>
        <Link
          to="/settings/notification"
          aria-label={t("通知の設定", "Notification settings")}
          title={t("通知の設定", "Notification settings")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <SettingsIcon className="size-5" />
        </Link>
      </header>

      {unreadCounts.moderation > 0 && (
        <Link
          to="/my/reports"
          className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 transition-colors hover:bg-orange-500/15"
        >
          <ShieldAlertIcon className="size-5 shrink-0 text-orange-600 dark:text-orange-400" />
          <span className="min-w-0 flex-1 font-medium text-sm">
            {t(
              `運営からのお知らせが ${unreadCounts.moderation} 件あります`,
              `${unreadCounts.moderation} notices from the Aipictors team`,
            )}
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* 種類が見切れないように折り返す */}
      <div
        role="tablist"
        aria-label={t("お知らせの種類", "Notification type")}
        className="flex flex-wrap gap-1.5"
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
              onClick={() => onChangeTab(item.value)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3 font-medium text-sm transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
              {item.count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-bold text-[10px] text-white">
                  {toBadgeText(item.count)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {tab === "WORK_COMMENT" && (
        <div className="flex gap-1 rounded-lg bg-muted/60 p-1 sm:w-fit">
          {(
            [
              { value: "all", label: t("すべて", "All") },
              { value: "notReplied", label: t("未返信", "Not replied") },
              { value: "replied", label: t("返信済み", "Replied") },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={replyFilter === item.value}
              onClick={() => onChangeReplyFilter(item.value)}
              className={cn(
                "h-8 flex-1 rounded-md px-4 font-medium text-xs transition-colors sm:flex-none",
                replyFilter === item.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        {tab === "MESSAGE" ? (
          <MessageList unread={unreadCounts} onClose={() => {}} />
        ) : unread === null ? (
          <RowSkeletons />
        ) : (
          <NotificationHistory
            key={`${tab}:${replyFilter}`}
            tab={tab}
            replyFilter={tab === "WORK_COMMENT" ? replyFilter : "all"}
            unread={unreadCounts}
          />
        )}
      </div>
    </div>
  )
}

/**
 * 通知の一覧。下まで来たら続きを読む
 */
function NotificationHistory(props: {
  tab: Exclude<Tab, "MESSAGE">
  replyFilter: ReplyFilter
  unread: UnreadCounts
}) {
  const t = useTranslation()
  const client = useApolloClient()
  const [items, setItems] = useState<PanelItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)
  const isFetchingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setIsLoading(true)
    setIsError(false)
    try {
      const result = await client.query({
        query: panelNotificationsQuery,
        fetchPolicy: "no-cache",
        variables: {
          offset: offsetRef.current,
          limit: PAGE_SIZE,
          where: {
            ...TAB_WHERE[TAB_TO_WHERE[props.tab]],
            ...(props.replyFilter !== "all" && {
              isReplied: props.replyFilter === "replied",
            }),
          },
        },
      })
      const nodes = result.data?.viewer?.notifications ?? []
      offsetRef.current += nodes.length
      setItems((current) => {
        const known = new Set(current.map((item) => item.id))
        return [
          ...current,
          ...toPanelItems(nodes).filter((item) => !known.has(item.id)),
        ]
      })
      setHasMore(nodes.length >= PAGE_SIZE && offsetRef.current < MAX_OFFSET)
    } catch {
      setIsError(true)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [client, props.tab, props.replyFilter])

  useEffect(() => {
    void loadMore()
  }, [loadMore])

  // 下のフッターに画面が追従すると、足した分だけ下へ送られて全部読み続けてしまう
  useEffect(() => {
    const root = document.documentElement
    root.style.overflowAnchor = "none"
    return () => {
      root.style.overflowAnchor = ""
    }
  }, [])

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = sentinelRef.current
    if (!element || !hasMore || isError) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore()
      },
      { rootMargin: "600px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [hasMore, isError, loadMore, items.length])

  const emptyText =
    props.replyFilter === "notReplied"
      ? t("未返信のコメントはありません", "No comments waiting for a reply")
      : props.replyFilter === "replied"
        ? t("返信済みのコメントはありません", "No replied comments yet")
        : undefined

  return (
    <>
      {isError && items.length === 0 ? null : (
        <RowList
          items={items}
          isLoading={isLoading && items.length === 0}
          unread={props.unread}
          onClose={() => {}}
          isExpanded
          emptyText={emptyText}
          renderFooter={(item) =>
            (item.kind === "comment" || item.kind === "reply") &&
            item.replyTargetCommentId ? (
              <InlineReply item={item} />
            ) : null
          }
        />
      )}
      {isError && (
        <div className="flex flex-col items-center gap-2 p-6">
          <p className="text-muted-foreground text-sm">
            {t("読み込めませんでした", "Could not load notifications")}
          </p>
          <Button variant="secondary" size="sm" onClick={() => void loadMore()}>
            {t("もう一度読み込む", "Try again")}
          </Button>
        </div>
      )}
      {hasMore && !isError && items.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center p-4">
          {isLoading && (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
      {!hasMore && offsetRef.current >= MAX_OFFSET && (
        <p className="p-4 text-center text-muted-foreground text-xs">
          {t(
            "表示できるのは新しい約1,000件までです",
            "Only about the latest 1,000 notifications can be shown",
          )}
        </p>
      )}
    </>
  )
}

/**
 * その場で返信する（作品ページに移らなくていいように）
 */
function InlineReply(props: { item: PanelItem }) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState("")
  const [sentTexts, setSentTexts] = useState<string[]>([])
  const [createReply, { loading }] = useMutation(createResponseCommentMutation)

  const replies = props.item.myReplies

  const onSend = async () => {
    const value = text.trim()
    if (value.length === 0 || loading || !props.item.replyTargetCommentId) {
      return
    }
    try {
      await createReply({
        variables: {
          input: { commentId: props.item.replyTargetCommentId, text: value },
        },
      })
      setSentTexts((current) => [...current, value])
      setText("")
      setIsOpen(false)
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("返信できませんでした", "Could not send your reply"),
      )
    }
  }

  const hasReplied = replies.length > 0 || sentTexts.length > 0

  return (
    <div className="space-y-2 px-4 pb-3 pl-[68px]">
      {[...replies.map((reply) => reply.text ?? ""), ...sentTexts]
        .filter((value) => value.length > 0)
        .slice(0, 3)
        .map((value, index) => (
          <p
            key={`${index}-${value}`}
            className="line-clamp-2 border-l-2 pl-2 text-muted-foreground text-xs"
          >
            <span className="mr-1 font-medium">{t("あなた", "You")}:</span>
            {value}
          </p>
        ))}
      {isOpen ? (
        <div className="space-y-2">
          <Textarea
            autoFocus
            rows={2}
            maxLength={500}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                void onSend()
              }
            }}
            placeholder={t("返信を入力", "Write a reply")}
            aria-label={t("返信を入力", "Write a reply")}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              {t("閉じる", "Close")}
            </Button>
            <Button
              size="sm"
              onClick={() => void onSend()}
              disabled={loading || text.trim().length === 0}
            >
              {loading ? (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              ) : (
                <SendIcon className="mr-1 size-4" />
              )}
              {t("返信する", "Reply")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 font-medium text-muted-foreground text-xs hover:text-foreground"
        >
          {hasReplied ? (
            <CheckIcon className="size-3.5 text-emerald-500" />
          ) : (
            <ReplyIcon className="size-3.5" />
          )}
          {hasReplied
            ? t("返信済み・もう一度返信する", "Replied. Reply again")
            : t("返信する", "Reply")}
        </button>
      )}
    </div>
  )
}

const unreadCountsQuery = graphql(
  `query NotificationPageUnreadCounts {
    viewer {
      id
      unreadNotificationCounts {
        liked
        comment
        reply
        follow
        award
        message
        moderation
      }
    }
  }`,
)

const markNotificationsAsReadMutation = graphql(
  `mutation MarkNotificationsAsReadFromPage {
    markNotificationsAsRead
  }`,
)

const createResponseCommentMutation = graphql(
  `mutation CreateNotificationReply($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }`,
)
