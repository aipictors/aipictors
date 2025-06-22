import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react"
import { type FragmentOf, graphql } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useQuery } from "@apollo/client/index"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { WorkArticle } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

// ───────────────── Types ─────────────────
interface Props {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  startIndex: number
  onClose: () => void
  /** TagWorkSection から渡される追加ロード関数 */
  loadMore?: () => void
  hasNextPage?: boolean
  isLoadingMore?: boolean
}

// ───────────────── Component ─────────────────
export function WorkViewerDialog({
  works,
  startIndex,
  onClose,
  loadMore,
  hasNextPage = false,
  isLoadingMore = false,
}: Props) {
  // ────────── State / Refs ──────────
  const [index, setIndex] = useState(startIndex)

  const thumbListRef = useRef<HTMLDivElement | null>(null) // サムネ列 root
  const sentinelRef = useRef<HTMLDivElement | null>(null) // 監視要素

  /* ────────────────────────────────────────────────
   * 追加ロード判定関数（スクロール量を直接判定）
   * ------------------------------------------------- */
  const mayNeedLoadMore = useCallback(() => {
    if (!thumbListRef.current || !loadMore || !hasNextPage || isLoadingMore)
      return
    const el = thumbListRef.current
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distance < 150) {
      loadMore()
    }
  }, [loadMore, hasNextPage, isLoadingMore])

  /* ────────────────────────────────────────────────
   * IntersectionObserver — サムネ列監視
   * ------------------------------------------------- */
  useEffect(() => {
    if (
      !loadMore ||
      !hasNextPage ||
      !thumbListRef.current ||
      !sentinelRef.current
    )
      return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) loadMore()
      },
      { root: thumbListRef.current, rootMargin: "200px 0px 200px 0px" },
    )

    observer.observe(sentinelRef.current)

    // 初期表示時に sentinel が既に可視 or バーが無い場合のフォールバック
    mayNeedLoadMore()

    return () => observer.disconnect()
  }, [loadMore, hasNextPage, isLoadingMore, works.length, mayNeedLoadMore])

  /* ────────────────────────────────────────────────
   * scroll フォールバック
   * ------------------------------------------------- */
  useEffect(() => {
    if (!thumbListRef.current || !loadMore || !hasNextPage) return
    const el = thumbListRef.current

    // 初回チェック
    mayNeedLoadMore()

    const onScroll = () => {
      mayNeedLoadMore()
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [loadMore, hasNextPage, isLoadingMore, mayNeedLoadMore])

  /* ────────── index が末尾なら自動ロード ────────── */
  useEffect(() => {
    if (
      index === works.length - 1 &&
      hasNextPage &&
      !isLoadingMore &&
      loadMore
    ) {
      loadMore()
    }
  }, [index, works.length, hasNextPage, isLoadingMore, loadMore])

  // ────────── 現在の作品 ──────────
  const work = works[index]

  // ────────── GraphQL ──────────
  const { data, refetch } = useQuery(workDialogQuery, {
    variables: { workId: work.id },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
  })
  useEffect(() => {
    refetch({ workId: work.id })
  }, [work.id, refetch])

  // ────────── ナビゲーション ──────────
  const next = useCallback(
    () => setIndex((i) => (i < works.length - 1 ? i + 1 : i)),
    [works.length],
  )
  const prev = useCallback(
    () => setIndex((i) => (i ? i - 1 : works.length - 1)),
    [works.length],
  )

  // ────────── キー / ホイール ──────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
      if (e.key === "Escape") onClose()
    }

    const wheel = (e: WheelEvent) => {
      if (!thumbListRef.current) return
      const el = thumbListRef.current
      const atBottom =
        el.scrollHeight - Math.ceil(el.scrollTop + el.clientHeight) <= 0 &&
        e.deltaY > 0
      if (atBottom) next()
    }

    window.addEventListener("keydown", onKey)
    thumbListRef.current?.addEventListener("wheel", wheel as any, {
      passive: true,
    })
    return () => {
      window.removeEventListener("keydown", onKey)
      thumbListRef.current?.removeEventListener("wheel", wheel as any)
    }
  }, [prev, next, onClose])

  const currentWork = data?.work ?? work

  // ───────────────── Render ─────────────────
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] w-[100vw] max-w-[100vw] overflow-hidden p-0">
        {/* 詳細パネル (Desktop) */}
        <aside className="hidden w-full flex-col bg-background/80 backdrop-blur-sm md:flex">
          <DialogHeader className="border-b p-4 pb-2">
            <DialogTitle className="truncate font-bold text-lg">
              {currentWork.title}
            </DialogTitle>
            <div className="mt-2 flex items-center space-x-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={withIconUrlFallback(currentWork.user?.iconUrl)}
                />
                <AvatarFallback />
              </Avatar>
              <span className="font-medium text-sm">
                {currentWork.user?.name}
              </span>
            </div>
          </DialogHeader>
          <div className="flex flex-1 flex-col gap-y-6 overflow-y-auto overscroll-y-contain p-4">
            <WorkArticle work={currentWork} userSetting={undefined} />
            <WorkCommentList
              workId={currentWork.id}
              workOwnerIconImageURL={withIconUrlFallback(
                currentWork.user?.iconUrl,
              )}
              comments={
                Array.isArray(
                  (currentWork as { comments?: unknown[] }).comments,
                )
                  ? ((currentWork as any).comments.map((c: any) => ({
                      ...c,
                      responses: null,
                    })) as any)
                  : []
              }
              defaultShowCommentCount={8}
            />
          </div>
        </aside>

        {/* サムネイル列 */}
        <aside
          ref={thumbListRef}
          className="ml-auto hidden h-full w-24 flex-col overflow-y-auto overscroll-y-contain bg-background/60 backdrop-blur-sm md:flex"
        >
          {works.map((w, i) => (
            <button
              key={w.id}
              type="button"
              className={`relative m-1 rounded-md ring-offset-2 focus:outline-none focus:ring-2 ${i === index ? "ring ring-primary" : ""}`}
              onClick={() => setIndex(i)}
            >
              <img
                src={w.smallThumbnailImageURL}
                alt={w.title}
                className="h-20 w-full rounded-md object-cover"
              />
            </button>
          ))}

          {/* sentinel & spinner */}
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
          <div ref={sentinelRef} className="h-[2px] w-full" />
        </aside>
      </DialogContent>

      {/* モバイル用：画像下にキャプション */}
      <div className="px-4 pt-4 pb-8 md:hidden">
        <h2 className="truncate font-bold text-lg">{currentWork.title}</h2>
        <div className="mt-2 flex items-center space-x-2">
          <Avatar className="size-6">
            <AvatarImage src={withIconUrlFallback(currentWork.user?.iconUrl)} />
            <AvatarFallback />
          </Avatar>
          <span className="font-medium text-sm">{currentWork.user?.name}</span>
        </div>
      </div>
    </Dialog>
  )
}

// ───────────────── GraphQL Fragments ─────────────────
export const workArticleFragment =
  graphql(`fragment WorkArticle on WorkNode @_unmask {
  id
  isMyRecommended
  title
  mdUrl
  accessType
  type
  adminAccessType
  promptAccessType
  rating
  description
  isSensitive
  enTitle
  enDescription
  imageURL
  largeThumbnailImageURL
  largeThumbnailImageWidth
  largeThumbnailImageHeight
  smallThumbnailImageURL
  smallThumbnailImageWidth
  smallThumbnailImageHeight
  thumbnailImagePosition
  subWorksCount
  url
  isDeleted
  user {
    id
    biography
    enBiography
    login
    nanoid
    name
    receivedLikesCount
    receivedViewsCount
    awardsCount
    followersCount
    worksCount
    iconUrl
    headerImageUrl
    webFcmToken
    isFollower
    isFollowee
    headerImageUrl
    receivedLikesCount
    createdLikesCount
    createdBookmarksCount
    isMuted
    works(offset: 0, limit: 16, where: { ratings: [G, R15] }) {
      id
      userId
      largeThumbnailImageURL
      largeThumbnailImageWidth
      largeThumbnailImageHeight
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
      subWorksCount
      commentsCount
      isLiked
    }
    promptonUser {
      id
    }
  }
  likedUsers(offset: 0, limit: 120) {
    id
    name
    iconUrl
    login
  }
  album {
    id
    title
    description
  }
  dailyTheme {
    id
    title
    dateText
  }
  tagNames
  createdAt
  likesCount
  viewsCount
  commentsCount
  subWorks {
    id
    imageUrl
  }
  nextWork {
    id
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
  }
  previousWork {
    id
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
  }
  model
  modelHash
  generationModelId
  workModelId
  isTagEditable
  isCommentsEditable
  isLiked
  isBookmarked
  isInCollection
  isPromotion
  isGeneration
  ogpThumbnailImageUrl
  prompt
  negativePrompt
  noise
  seed
  steps
  sampler
  scale
  strength
  vae
  clipSkip
  otherGenerationParams
  pngInfo
  style
  url
  updatedAt
  dailyRanking
  weeklyRanking
  monthlyRanking
  relatedUrl
  nanoid
}`)

export const WorkCommentFragment =
  graphql(`fragment WorkComment on CommentNode @_unmask {
  id
  createdAt
  text
  likesCount
  isWorkOwnerLiked
  isLiked
  user {
    id
    name
    login
    iconUrl
    nanoid
  }
  sticker {
    id
    imageUrl
    title
    isDownloaded
    likesCount
    usesCount
    downloadsCount
    accessType
  }
}`)

// ───────────────── GraphQL Query ─────────────────
const workDialogQuery = graphql(
  `query WorkDialog($workId: ID!) {
    work(id: $workId) {
      ...WorkArticle
      comments(offset: 0, limit: 128) {
        ...WorkComment
      }
      user {
        iconUrl
      }
    }
    viewer {
      id
    }
  }`,
  [workArticleFragment, WorkCommentFragment],
)
