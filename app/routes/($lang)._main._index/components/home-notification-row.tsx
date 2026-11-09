import { toResizedImageUrl } from "~/utils/resized-image-url"
import {
  AwardIcon,
  CoinsIcon,
  HeartIcon,
  type LucideIcon,
  MessageCircleIcon,
  ReplyIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { SupportCoinBreakdown } from "~/components/support-coin-breakdown"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  type PanelItem,
  type PanelParentComment,
  toRowHref,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-items"
import type {
  NotificationPanelKind,
  NotificationRow,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

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

export function NotificationRowView(props: {
  row: NotificationRow<PanelItem>
  onClose: () => void
  isExpanded?: boolean
  footer?: React.ReactNode
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
            {t.workTitle(item.work.title, item.work.enTitle)}
          </p>
        )}
        {item.parentComment && (
          <ParentCommentQuote
            comment={item.parentComment}
            isExpanded={props.isExpanded}
          />
        )}
        {item.message && item.kind !== "award" && item.kind !== "coin" && (
          <p
            className={cn(
              "whitespace-pre-line break-words leading-relaxed",
              props.isExpanded
                ? "rounded-lg bg-muted/60 px-3 py-2 text-foreground text-sm"
                : "line-clamp-2 text-muted-foreground text-xs",
            )}
          >
            {item.message}
          </p>
        )}
        {item.support && item.support.totalPt > 0 && (
          <SupportCoinBreakdown
            freeCoinAmount={item.support.freeCoinAmount}
            premiumCoinAmount={item.support.premiumCoinAmount}
            totalPt={item.support.totalPt}
          />
        )}
        {item.stickerUrl && (
          <img
            src={item.stickerUrl}
            alt={t("スタンプ", "Sticker")}
            loading="lazy"
            className={cn(
              "rounded-md object-cover",
              props.isExpanded ? "size-24" : "size-12",
            )}
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
          src={toResizedImageUrl(item.work.smallThumbnailImageURL, 240)}
          alt={
            item.work.title
              ? t.workTitle(item.work.title, item.work.enTitle)
              : ""
          }
          loading="lazy"
          className={cn(
            "shrink-0 rounded-lg object-cover",
            props.isExpanded ? "size-14 md:size-16" : "size-11",
          )}
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
    <>
      <Link
        to={href}
        onClick={props.onClose}
        className={cn(rowClassName, "hover:bg-muted/60")}
      >
        {body}
      </Link>
      {props.footer}
    </>
  )
}

/**
 * 返信先のコメント（自分のコメントなら「あなたのコメント」）
 */
function ParentCommentQuote(props: {
  comment: PanelParentComment
  isExpanded?: boolean
}) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { comment } = props
  const isMine =
    comment.user?.id !== undefined && comment.user.id === authContext.userId
  const stickerUrl = comment.sticker?.imageUrl

  return (
    <div className="space-y-1 border-l-2 pl-2 text-muted-foreground text-xs">
      <p className="font-medium">
        {isMine
          ? t("あなたのコメント", "Your comment")
          : t(
              `${comment.user?.name ?? "匿名のユーザー"}さんのコメント`,
              `${comment.user?.name ?? "Someone"}'s comment`,
            )}
      </p>
      {comment.text && (
        <p
          className={cn(
            "whitespace-pre-line break-words leading-relaxed",
            !props.isExpanded && "line-clamp-2",
          )}
        >
          {comment.text}
        </p>
      )}
      {stickerUrl && (
        <img
          src={stickerUrl}
          alt={t("スタンプ", "Sticker")}
          loading="lazy"
          className={cn(
            "rounded-md object-cover",
            props.isExpanded ? "size-16" : "size-10",
          )}
        />
      )}
    </div>
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
