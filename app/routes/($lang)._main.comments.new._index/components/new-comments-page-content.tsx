import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { type ReactNode, useState, useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import {
  appFilterChipClassName,
  appPillRowClassName,
} from "~/components/app/app-pill-tab"
import { useTranslation } from "~/hooks/use-translation"
import { Loader2, MessageCircleIcon, Sticker, Type } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "~/lib/utils"
import { isEmptyComment } from "~/utils/empty-comment"
import {
  NewCommentCard,
  type NewCommentItem,
} from "~/routes/($lang)._main.comments.new._index/components/new-comment-card"

type Comment = NewCommentItem

type CommentFilter = "all" | "text-only" | "sticker-only"

const PAGE_SIZE = 24

type Props = {
  initialComments: Comment[]
  /** R18 の一覧（/r/comments/new） */
  isSensitive?: boolean
  /** loader で取得したときの絞り込み（表示中の一覧と選択中のタブをそろえる） */
  initialFilter?: CommentFilter
}

/** 同じコメントを 2 回出さない（ページ送りの間に新しいコメントが増えるとずれて重なる） */
const mergeComments = (prev: Comment[], next: Comment[]) => {
  const seen = new Set(
    prev.map((item) => item.comment?.id ?? `${item.createdAt}`),
  )
  return [
    ...prev,
    ...next.filter(
      (item) => !seen.has(item.comment?.id ?? `${item.createdAt}`),
    ),
  ]
}

export function NewCommentsPageContent(props: Props) {
  const ratingWhere = props.isSensitive
    ? { isSensitive: true, ratings: ["R18" as const, "R18G" as const] }
    : { isSensitive: false, ratings: ["G" as const, "R15" as const] }

  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [filter, setFilter] = useState<CommentFilter>(
    props.initialFilter ?? "all",
  )
  const [offset, setOffset] = useState(PAGE_SIZE)
  const [allComments, setAllComments] = useState<Comment[]>(
    props.initialComments || [],
  )
  // 本文もスタンプも無い（推しだけの）コメントは出さない（ページ送りの位置は allComments で数える）
  const visibleComments = allComments.filter(
    (item) =>
      !isEmptyComment({ text: item.comment?.text, sticker: item.sticker }),
  )
  /** もっと見るの読み込み中 */
  const [isLoading, setIsLoading] = useState(false)
  /** 絞り込みを変えて一覧を入れ替えている途中 */
  const [isReplacing, setIsReplacing] = useState(false)
  const [hasMore, setHasMore] = useState(
    (props.initialComments?.length ?? 0) >= PAGE_SIZE,
  )

  // いいね機能の状態管理
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])

  // GraphQL Mutations
  const [createCommentLike] = useMutation(createCommentLikeMutation)
  const [deleteCommentLike] = useMutation(deleteCommentLikeMutation)

  const toWhere = (value: CommentFilter) => ({
    ...ratingWhere,
    ...(value === "text-only" && { isTextOnly: true }),
    ...(value === "sticker-only" && { isStickerOnly: true }),
  })

  const { refetch } = useQuery(newCommentsQuery, {
    skip: true,
    variables: {
      offset,
      where: toWhere(filter),
    },
  })

  // いいねの最終状態を判定する関数
  const getFinalLikeState = (commentId: string, serverIsLiked: boolean) => {
    const isLocallyLiked = likedCommentIds.includes(commentId)
    const isLocallyCanceled = canceledCommentIds.includes(commentId)

    // ローカル操作が優先される
    if (isLocallyLiked) return true
    if (isLocallyCanceled) return false

    // ローカル操作がない場合はサーバー状態
    return serverIsLiked
  }

  // いいね数の最終状態を計算する関数
  const getFinalLikeCount = (
    commentId: string,
    serverCount: number,
    serverIsLiked: boolean,
  ) => {
    const isLocallyLiked = likedCommentIds.includes(commentId)
    const isLocallyCanceled = canceledCommentIds.includes(commentId)

    let adjustment = 0

    if (isLocallyLiked && !serverIsLiked) {
      adjustment = 1 // サーバーではいいねしていないが、ローカルでいいねした
    } else if (isLocallyCanceled && serverIsLiked) {
      adjustment = -1 // サーバーではいいねしているが、ローカルでキャンセルした
    }

    return Math.max(0, serverCount + adjustment)
  }
  useEffect(() => {
    const refetchCommentsForLoginState = async () => {
      if (authContext.isLoggedIn && !authContext.isLoading) {
        // ログイン完了時に現在のフィルター条件で全体を再取得
        try {
          const result = await refetch({
            offset: 0,
            where: toWhere(filter),
          })

          if (result.data?.newComments) {
            setAllComments(result.data.newComments as Comment[])
            setOffset(PAGE_SIZE)
            setHasMore(result.data.newComments.length >= PAGE_SIZE)
            // ローカルのいいね状態をクリア
            setLikedCommentIds([])
            setCanceledCommentIds([])
          }
        } catch (error) {
          console.error("Failed to refetch comments after login:", error)
        }
      }
    }

    // ログイン状態が確定した時のみ実行
    if (!authContext.isLoading) {
      refetchCommentsForLoginState()
    }
  }, [authContext.isLoggedIn, authContext.isLoading])

  // いいねを作成
  const onCreateCommentLike = async (commentId: string) => {
    if (!authContext.isLoggedIn) {
      toast(t("ログインが必要です", "Login required"))
      return
    }

    try {
      await createCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds([...likedCommentIds, commentId])
      setCanceledCommentIds(canceledCommentIds.filter((id) => id !== commentId))
    } catch (error) {
      console.error("Failed to like comment:", error)
      toast(t("いいねに失敗しました", "Failed to like"))
    }
  }

  // いいねを削除
  const onDeleteCommentLike = async (commentId: string) => {
    try {
      await deleteCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds(likedCommentIds.filter((id) => id !== commentId))
      setCanceledCommentIds([...canceledCommentIds, commentId])
    } catch (error) {
      console.error("Failed to unlike comment:", error)
      toast(t("いいねの取り消しに失敗しました", "Failed to unlike"))
    }
  }

  const loadMoreComments = async () => {
    setIsLoading(true)
    try {
      const result = await refetch({
        offset,
        where: toWhere(filter),
      })

      if (result.data?.newComments) {
        const next = result.data.newComments as Comment[]
        setAllComments((prev) => mergeComments(prev, next))
        setOffset((prev) => prev + PAGE_SIZE)
        setHasMore(next.length >= PAGE_SIZE)
      }
    } catch (error) {
      console.error("Failed to load more comments:", error)
      toast(t("読み込みに失敗しました", "Failed to load"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = async (value: CommentFilter) => {
    if (value === filter || isReplacing) return
    setFilter(value)
    setOffset(PAGE_SIZE)
    setIsReplacing(true)

    try {
      const result = await refetch({
        offset: 0,
        where: toWhere(value),
      })

      if (result.data?.newComments) {
        // フィルター変更時は完全に新しいデータに置き換える
        setAllComments(result.data.newComments as Comment[])
        setHasMore(result.data.newComments.length >= PAGE_SIZE)
      }
    } catch (error) {
      console.error("Failed to filter comments:", error)
      toast(t("読み込みに失敗しました", "Failed to load"))
    } finally {
      setIsReplacing(false)
    }
  }

  const filterChips: Array<{
    value: CommentFilter
    label: string
    icon: ReactNode
  }> = [
    {
      value: "all",
      label: t("すべて", "All"),
      icon: <MessageCircleIcon className="size-4" aria-hidden="true" />,
    },
    {
      value: "text-only",
      label: t("テキストあり", "With text"),
      icon: <Type className="size-4" aria-hidden="true" />,
    },
    {
      value: "sticker-only",
      label: t("スタンプ", "Stickers"),
      icon: <Sticker className="size-4" aria-hidden="true" />,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ヘッダー */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageCircleIcon
            className="size-6 text-primary"
            aria-hidden="true"
          />
          <h1 className="font-bold text-xl md:text-2xl">
            {t("新着コメント", "New Comments")}
          </h1>
          {props.isSensitive && (
            <Badge variant="destructive" className="text-xs">
              R18
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t(
            "作品に付いたばかりのコメントです。サムネイルを押すとそのコメントの場所へ移動します。",
            "Comments just posted on works. Tap a thumbnail to jump to the comment.",
          )}
        </p>
      </header>

      {/* 絞り込み（画面の上に残す） */}
      <div className="sticky top-14 z-10 mt-3 bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-16">
        <div
          role="tablist"
          aria-label={t("絞り込み", "Filter")}
          className={appPillRowClassName}
        >
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              role="tab"
              aria-selected={filter === chip.value}
              onClick={() => handleFilterChange(chip.value)}
              className={cn(
                appFilterChipClassName(filter === chip.value),
                "h-9",
              )}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* コメント一覧 */}
      {isReplacing ? (
        <div className="divide-y sm:space-y-3 sm:divide-y-0" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              key={index}
              className="flex gap-3 py-3 sm:gap-4 sm:rounded-2xl sm:border sm:p-4"
            >
              <Skeleton className="size-16 shrink-0 rounded-xl sm:size-24" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-3/4 rounded-2xl" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleComments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
          <MessageCircleIcon className="size-10 text-muted-foreground" />
          <p className="font-semibold">
            {t("コメントが見つかりません", "No comments found")}
          </p>
          <p className="text-muted-foreground text-sm">
            {filter === "text-only"
              ? t("テキストコメントがまだありません", "No text comments yet")
              : filter === "sticker-only"
                ? t(
                    "スタンプコメントがまだありません",
                    "No sticker comments yet",
                  )
                : t("コメントがまだありません", "No comments yet")}
          </p>
        </div>
      ) : (
        <ul className="divide-y sm:space-y-3 sm:divide-y-0">
          {visibleComments.map((item) => {
            const commentId = item.comment?.id
            const serverIsLiked = item.comment?.isLiked ?? false
            const isLiked = commentId
              ? getFinalLikeState(commentId, serverIsLiked)
              : false
            const likesCount = commentId
              ? getFinalLikeCount(
                  commentId,
                  item.comment?.likesCount ?? 0,
                  serverIsLiked,
                )
              : 0
            return (
              <li key={`${commentId}-${item.createdAt}`}>
                <NewCommentCard
                  item={item}
                  isLiked={isLiked}
                  likesCount={likesCount}
                  canLike={authContext.isLoggedIn}
                  onToggleLike={() => {
                    if (!commentId) return
                    if (isLiked) {
                      onDeleteCommentLike(commentId)
                    } else {
                      onCreateCommentLike(commentId)
                    }
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}

      {/* もっと見る */}
      {!isReplacing && visibleComments.length > 0 && (
        <div className="flex justify-center py-6">
          {hasMore ? (
            <Button
              onClick={loadMoreComments}
              disabled={isLoading}
              variant="secondary"
              className="h-11 min-w-48 rounded-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("読み込み中...", "Loading...")}
                </>
              ) : (
                t("もっと見る", "Load more")
              )}
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t(
                "ここまでのコメントをすべて表示しました",
                "You've reached the end",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const newCommentsQuery = graphql(
  `query NewComments($offset: Int!, $where: NewCommentsWhereInput) {
    newComments: newComments(
      offset: $offset,
      limit: 24,
      where: $where
    ) {
      user {
        id
        name
        login
        iconUrl
      }
      sticker {
        id
        imageUrl
        title
      }
      work {
        id
        title
        smallThumbnailImageURL
        smallThumbnailImageHeight
        smallThumbnailImageWidth
        thumbnailImagePosition
      }
      comment {
        id
        text
        likesCount
        isLiked
      }
      createdAt
    }
  }`,
)

const createCommentLikeMutation = graphql(
  `mutation CreateCommentLike($input: CreateCommentLikeInput!) {
    createCommentLike(input: $input) {
      id
    }
  }`,
)

const deleteCommentLikeMutation = graphql(
  `mutation DeleteCommentLike($input: DeleteCommentLikeInput!) {
    deleteCommentLike(input: $input) {
      id
    }
  }`,
)
