import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState, useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import {
  MessageCircleIcon,
  Filter,
  Type,
  Sticker,
  ThumbsUp,
} from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "~/lib/utils"

type Comment = {
  user: {
    id: string
    name: string
    login: string
    iconUrl: string | null
  } | null
  sticker: {
    id: string
    imageUrl: string | null
    title: string
  } | null
  work: {
    id: string
    smallThumbnailImageURL: string | null
    smallThumbnailImageHeight: number | null
    smallThumbnailImageWidth: number | null
    thumbnailImagePosition: number | null
  } | null
  comment: {
    id: string
    text: string
    likesCount: number
    isLiked: boolean
  } | null
  createdAt: number
}

type Props = {
  initialComments: Comment[]
}

export function NewCommentsPageContent(props: Props) {
  const t = useTranslation()
  const authUser = useContext(AuthContext)

  const [filter, setFilter] = useState<"all" | "text-only" | "sticker-only">(
    "all",
  )
  const [offset, setOffset] = useState(24)
  const [allComments, setAllComments] = useState<Comment[]>(
    props.initialComments || [],
  )
  const [isLoading, setIsLoading] = useState(false)

  // いいね機能の状態管理
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])

  // サーバー側でフィルタリング済みなので、クライアントサイドでの追加フィルタリングは不要
  const filteredComments = allComments

  const { refetch } = useQuery(newCommentsQuery, {
    skip: true,
    variables: {
      offset,
      where: {
        isSensitive: true,
        ratings: ["R18", "R18G"],
        ...(filter === "text-only" && { isTextOnly: true }),
        ...(filter === "sticker-only" && { isStickerOnly: true }),
      },
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

  // GraphQL Mutations
  const [createCommentLike] = useMutation(createCommentLikeMutation)
  const [deleteCommentLike] = useMutation(deleteCommentLikeMutation)

  // ログイン状態が変わった時にコメント一覧を再取得（いいね状態の正確な反映のため）
  useEffect(() => {
    const refetchCommentsForLoginState = async () => {
      if (authUser.isLoggedIn && !authUser.isLoading) {
        // ログイン完了時に現在のフィルター条件で全体を再取得
        try {
          const result = await refetch({
            offset: 0,
            where: {
              isSensitive: true,
              ratings: ["R18", "R18G"],
              ...(filter === "text-only" && { isTextOnly: true }),
              ...(filter === "sticker-only" && { isStickerOnly: true }),
            },
          })

          if (result.data?.newComments) {
            setAllComments(result.data.newComments as Comment[])
            setOffset(24)
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
    if (!authUser.isLoading) {
      refetchCommentsForLoginState()
    }
  }, [authUser.isLoggedIn, authUser.isLoading])

  // いいねを作成
  const onCreateCommentLike = async (commentId: string) => {
    if (!authUser.isLoggedIn) {
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
        where: {
          isSensitive: true,
          ratings: ["R18", "R18G"],
          ...(filter === "text-only" && { isTextOnly: true }),
          ...(filter === "sticker-only" && { isStickerOnly: true }),
        },
      })

      if (result.data?.newComments) {
        setAllComments((prev) => [
          ...prev,
          ...(result.data.newComments as Comment[]),
        ])
        setOffset((prev) => prev + 24)
      }
    } catch (error) {
      console.error("Failed to load more comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = async (
    value: "all" | "text-only" | "sticker-only",
  ) => {
    setFilter(value)
    setOffset(24)
    setIsLoading(true)

    try {
      const result = await refetch({
        offset: 0,
        where: {
          isSensitive: true,
          ratings: ["R18", "R18G"],
          ...(value === "text-only" && { isTextOnly: true }),
          ...(value === "sticker-only" && { isStickerOnly: true }),
        },
      })

      if (result.data?.newComments) {
        // フィルター変更時は完全に新しいデータに置き換える
        setAllComments(result.data.newComments as Comment[])
      }
    } catch (error) {
      console.error("Failed to filter comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MessageCircleIcon className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-2xl">
            {t("新規コメント一覧", "New Comments")}
          </h1>
          <Badge variant="destructive" className="text-xs">
            R18
          </Badge>
        </div>

        {/* フィルタ */}
        <Card className="border-none bg-muted/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              {t("絞り込み", "Filter")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <MessageCircleIcon className="h-4 w-4" />
                        {t("すべて", "All")}
                      </div>
                    </SelectItem>
                    <SelectItem value="text-only">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        {t("テキストのみ", "Text Only")}
                      </div>
                    </SelectItem>
                    <SelectItem value="sticker-only">
                      <div className="flex items-center gap-2">
                        <Sticker className="h-4 w-4" />
                        {t("スタンプのみ", "Sticker Only")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {filter === "text-only" && (
                  <Badge variant="secondary" className="ml-2">
                    <Type className="mr-1 h-3 w-3" />
                    {t("テキストのみ表示中", "Showing text only")}
                  </Badge>
                )}

                {filter === "sticker-only" && (
                  <Badge variant="secondary" className="ml-2">
                    <Sticker className="mr-1 h-3 w-3" />
                    {t("スタンプのみ表示中", "Showing stickers only")}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-sm">
                {filter === "text-only"
                  ? t(
                      "テキストが入力されているコメントのみを表示しています",
                      "Showing only comments with text content",
                    )
                  : filter === "sticker-only"
                    ? t(
                        "スタンプのみのコメントを表示しています",
                        "Showing only sticker comments",
                      )
                    : t(
                        "すべてのコメントを表示しています",
                        "Showing all comments",
                      )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* コメント一覧 */}
      <div className="grid gap-4">
        {filteredComments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <MessageCircleIcon className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">
                  {t("コメントが見つかりません", "No comments found")}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "text-only"
                    ? t(
                        "テキストコメントがまだありません",
                        "No text comments yet",
                      )
                    : filter === "sticker-only"
                      ? t(
                          "スタンプコメントがまだありません",
                          "No sticker comments yet",
                        )
                      : t("コメントがまだありません", "No comments yet")}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card
              key={`${comment.comment?.id}-${comment.createdAt}`}
              className="transition-colors hover:bg-muted/30"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 作品サムネイル */}
                  {comment.work?.smallThumbnailImageURL && (
                    <CroppedWorkSquare
                      workId={comment.work.id}
                      imageUrl={comment.work.smallThumbnailImageURL}
                      size="sm"
                      thumbnailImagePosition={
                        comment.work.thumbnailImagePosition ?? 0
                      }
                      imageWidth={comment.work.smallThumbnailImageWidth ?? 0}
                      imageHeight={comment.work.smallThumbnailImageHeight ?? 0}
                    />
                  )}

                  {/* コメント内容 */}
                  <div className="flex-1 space-y-2">
                    {/* ユーザー名 */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user?.name || t("匿名", "Anonymous")}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {t(
                          toElapsedTimeText(comment.createdAt),
                          toElapsedTimeEnText(comment.createdAt),
                        )}
                      </span>
                    </div>

                    {/* テキストコメント */}
                    {comment.comment?.text &&
                      comment.comment.text.trim().length > 0 && (
                        <div className="rounded-lg border bg-background p-3">
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {comment.comment.text}
                          </p>
                        </div>
                      )}

                    {/* スタンプ */}
                    {comment.sticker?.imageUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.sticker.imageUrl}
                          alt={comment.sticker.title || "sticker"}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        {comment.sticker.title && (
                          <span className="text-muted-foreground text-xs">
                            {t("スタンプ：", "Sticker: ")}
                            {comment.sticker.title}
                          </span>
                        )}
                      </div>
                    )}

                    {/* テキストもスタンプもない場合 */}
                    {(!comment.comment?.text ||
                      comment.comment.text.trim().length === 0) &&
                      !comment.sticker?.imageUrl && (
                        <div className="text-muted-foreground text-xs italic">
                          {t("(コメント内容なし)", "(No comment content)")}
                        </div>
                      )}

                    {/* いいねボタン */}
                    {comment.comment?.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          onClick={() => {
                            const commentId = comment.comment?.id
                            if (!commentId) return

                            const serverIsLiked =
                              comment.comment?.isLiked || false
                            const finalIsLiked = getFinalLikeState(
                              commentId,
                              serverIsLiked,
                            )

                            if (finalIsLiked) {
                              onDeleteCommentLike(commentId)
                            } else {
                              onCreateCommentLike(commentId)
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 p-1"
                          disabled={!authUser.isLoggedIn}
                        >
                          <ThumbsUp
                            className={cn("h-4 w-4", {
                              "fill-primary text-primary": (() => {
                                const commentId = comment.comment?.id
                                if (!commentId) return false

                                const serverIsLiked =
                                  comment.comment?.isLiked || false
                                return getFinalLikeState(
                                  commentId,
                                  serverIsLiked,
                                )
                              })(),
                            })}
                          />
                          <span className="text-sm">
                            {(() => {
                              const commentId = comment.comment?.id
                              if (!commentId) return 0

                              const serverCount =
                                comment.comment?.likesCount || 0
                              const serverIsLiked =
                                comment.comment?.isLiked || false
                              return getFinalLikeCount(
                                commentId,
                                serverCount,
                                serverIsLiked,
                              )
                            })()}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* もっと見るボタン */}
      {filteredComments.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={loadMoreComments}
            disabled={isLoading}
            variant="outline"
            className="min-w-32"
          >
            {isLoading
              ? t("読み込み中...", "Loading...")
              : t("もっと見る", "Load More")}
          </Button>
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
