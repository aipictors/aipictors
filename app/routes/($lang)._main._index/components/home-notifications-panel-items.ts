import type { NotificationPanelKind } from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import { toPopularWorksPathFromNotification } from "~/utils/popular-works-date"

export type PanelSupport = {
  freeCoinAmount: number
  premiumCoinAmount: number
  totalPt: number
}

export type PanelReply = {
  id: string
  text?: string | null
  sticker?: { imageUrl?: string | null } | null
}

export type PanelUser = {
  id: string
  name: string
  iconUrl?: string | null
  isFollowee?: boolean
}

export type PanelWork = {
  id: string
  title?: string | null
  enTitle?: string | null
  smallThumbnailImageURL?: string | null
}

/** 返信先のコメント（返信の通知で、何への返信か分かるように出す） */
export type PanelParentComment = {
  text?: string | null
  sticker?: { imageUrl?: string | null } | null
  user?: { id: string; name: string } | null
}

export type PanelItem = {
  id: string
  kind: NotificationPanelKind
  createdAt: number
  workId: string | null
  work: PanelWork | null
  user: PanelUser | null
  message: string | null
  stickerUrl: string | null
  isNotReplied: boolean
  support: PanelSupport | null
  replyTargetCommentId: string | null
  myReplies: PanelReply[]
  parentComment: PanelParentComment | null
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
  myReplies?: PanelReply[] | null
  support?: PanelSupport | null
  replyTargetCommentId?: string | null
  comment?: PanelParentComment | null
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
    support: node.support ?? null,
    replyTargetCommentId: node.replyTargetCommentId ?? null,
    myReplies: node.myReplies ?? [],
    parentComment: kind === "reply" ? (node.comment ?? null) : null,
  }
}

export const toPanelItems = (nodes: unknown): PanelItem[] =>
  ((nodes ?? []) as PanelNode[])
    .map(toPanelItem)
    .filter((item) => item !== null)
    .sort((a, b) => b.createdAt - a.createdAt)

export const TAB_WHERE = {
  ALL: { excludeCoin: true },
  COMMENT: { type: "WORK_COMMENT" },
  REPLY: { type: "COMMENT_REPLY" },
  LIKED: { type: "LIKED_WORK" },
  FOLLOW: { type: "FOLLOW" },
  AWARD: { type: "WORK_AWARD" },
  COIN: { type: "LIKED_WORKS_SUMMARY" },
} as const

export const toRowHref = (item: PanelItem) => {
  if (item.kind === "follow") {
    return item.user ? `/users/${item.user.id}` : null
  }
  if (item.kind === "coin") {
    return item.message?.startsWith("🏅") ? "/achievements" : null
  }
  // 「今日の人気作品に選ばれました」は、その日の人気作品の一覧へ
  if (item.kind === "award") {
    const popularPath = toPopularWorksPathFromNotification(item.message)
    if (popularPath !== null) return popularPath
  }
  return item.work ? `/posts/${item.work.id}` : null
}
