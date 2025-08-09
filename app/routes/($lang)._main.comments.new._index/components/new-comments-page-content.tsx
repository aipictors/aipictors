import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState, useContext } from "react"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { MessageCircleIcon, Filter, Type, Sticker } from "lucide-react"

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
  } | null
  createdAt: number
}

type Props = {
  initialComments: Comment[]
}

export function NewCommentsPageContent(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  
  const [filter, setFilter] = useState<"all" | "text-only" | "sticker-only">("all")
  const [offset, setOffset] = useState(24)
  const [allComments, setAllComments] = useState<Comment[]>(props.initialComments || [])
  const [isLoading, setIsLoading] = useState(false)

  // フィルタリング済みのコメント一覧
  const filteredComments = allComments.filter((comment) => {
    if (filter === "text-only") {
      return comment.comment?.text && comment.comment.text.trim().length > 0
    }
    if (filter === "sticker-only") {
      return comment.sticker?.imageUrl && (!comment.comment?.text || comment.comment.text.trim().length === 0)
    }
    return true
  })

  const { data: moreCommentsData, refetch } = useQuery(newCommentsQuery, {
    skip: true,
    variables: {
      offset,
      where: {
        isSensitive: false,
        ratings: ["G", "R15"],
        ...(filter === "text-only" && { isTextOnly: true }),
        ...(filter === "sticker-only" && { isStickerOnly: true }),
      },
    },
  })

  const loadMoreComments = async () => {
    setIsLoading(true)
    try {
      const result = await refetch({
        offset,
        where: {
          isSensitive: false,
          ratings: ["G", "R15"],
          ...(filter === "text-only" && { isTextOnly: true }),
          ...(filter === "sticker-only" && { isStickerOnly: true }),
        },
      })
      
      if (result.data?.newComments) {
        setAllComments(prev => [...prev, ...result.data.newComments])
        setOffset(prev => prev + 24)
      }
    } catch (error) {
      console.error("Failed to load more comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = async (value: "all" | "text-only" | "sticker-only") => {
    setFilter(value)
    setOffset(24)
    setIsLoading(true)
    
    try {
      const result = await refetch({
        offset: 0,
        where: {
          isSensitive: false,
          ratings: ["G", "R15"],
          ...(value === "text-only" && { isTextOnly: true }),
          ...(value === "sticker-only" && { isStickerOnly: true }),
        },
      })
      
      if (result.data?.newComments) {
        setAllComments(result.data.newComments)
      }
    } catch (error) {
      console.error("Failed to filter comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MessageCircleIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t("新規コメント一覧", "New Comments")}</h1>
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
                    <Type className="h-3 w-3 mr-1" />
                    {t("テキストのみ表示中", "Showing text only")}
                  </Badge>
                )}
                
                {filter === "sticker-only" && (
                  <Badge variant="secondary" className="ml-2">
                    <Sticker className="h-3 w-3 mr-1" />
                    {t("スタンプのみ表示中", "Showing stickers only")}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {filter === "text-only" 
                  ? t("テキストが入力されているコメントのみを表示しています", "Showing only comments with text content")
                  : filter === "sticker-only"
                  ? t("スタンプのみのコメントを表示しています", "Showing only sticker comments")
                  : t("すべてのコメントを表示しています", "Showing all comments")
                }
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
                    ? t("テキストコメントがまだありません", "No text comments yet")
                    : filter === "sticker-only"
                    ? t("スタンプコメントがまだありません", "No sticker comments yet")
                    : t("コメントがまだありません", "No comments yet")
                  }
                </p>
              </div>
            </div>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={`${comment.comment?.id}-${comment.createdAt}`} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* 作品サムネイル */}
                  {comment.work?.smallThumbnailImageURL && (
                    <CroppedWorkSquare
                      workId={comment.work.id}
                      imageUrl={comment.work.smallThumbnailImageURL}
                      size="sm"
                      thumbnailImagePosition={comment.work.thumbnailImagePosition ?? 0}
                      imageWidth={comment.work.smallThumbnailImageWidth}
                      imageHeight={comment.work.smallThumbnailImageHeight}
                    />
                  )}
                  
                  {/* コメント内容 */}
                  <div className="flex-1 space-y-2">
                    {/* ユーザー名 */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user?.name || t("匿名", "Anonymous")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(
                          toElapsedTimeText(comment.createdAt),
                          toElapsedTimeEnText(comment.createdAt),
                        )}
                      </span>
                    </div>
                    
                    {/* テキストコメント */}
                    {comment.comment?.text && comment.comment.text.trim().length > 0 && (
                      <div className="bg-background rounded-lg p-3 border">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
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
                          <span className="text-xs text-muted-foreground">
                            {t("スタンプ：", "Sticker: ")}{comment.sticker.title}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* テキストもスタンプもない場合 */}
                    {(!comment.comment?.text || comment.comment.text.trim().length === 0) && 
                     !comment.sticker?.imageUrl && (
                      <div className="text-xs text-muted-foreground italic">
                        {t("(コメント内容なし)", "(No comment content)")}
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
            {isLoading ? t("読み込み中...", "Loading...") : t("もっと見る", "Load More")}
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
      }
      createdAt
    }
  }`,
)
