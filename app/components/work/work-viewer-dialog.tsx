import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  type WheelEvent,
} from "react"
import { graphql, type FragmentOf } from "gql.tada"
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
import { Link } from "@remix-run/react"

// ───────────────── Types ─────────────────
interface Props {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  /** 表示を開始したい作品 ID（優先） */
  startWorkId?: string
  /** ID が無い場合に使うフォールバック index */
  startIndex?: number
  onClose: () => void
  /** TagWorkSection から渡される追加ロード関数 */
  loadMore?: () => void
  hasNextPage?: boolean
  isLoadingMore?: boolean
}

/** 要素を親要素の縦方向中央にスクロールして合わせる */
export function scrollItemIntoVerticalCenter(
  container: HTMLElement,
  item: HTMLElement,
  smooth = true,
) {
  const containerMiddle = container.clientHeight / 2
  const itemMiddle = item.offsetTop + item.clientHeight / 2
  const newTop = itemMiddle - containerMiddle
  container.scrollTo({
    top: newTop,
    behavior: smooth ? "smooth" : "auto",
  })
}

// ───────────────── Component ─────────────────
export function WorkViewerDialog({
  works,
  startIndex,
  onClose,
  loadMore,
  hasNextPage = false,
  isLoadingMore = false,
  startWorkId,
}: Props) {
  // ────────── State / Refs ──────────
  const initialIndex = useMemo(() => {
    if (startWorkId) {
      const idx = works.findIndex((w) => w.id === startWorkId)
      if (idx !== -1) return idx
    }
    return startIndex ?? 0
  }, [startWorkId, startIndex, works])

  const [index, setIndex] = useState(initialIndex)
  const [loadedWorkIds, setLoadedWorkIds] = useState<Set<string>>(new Set())
  const [workDataCache, setWorkDataCache] = useState<Map<string, any>>(
    new Map(),
  )

  // デバウンス用の状態
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const isFirstScrollDone = useRef(false)

  const thumbListRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ────────── 現在の作品 ──────────
  const work = works[index]
  const isWorkCached = workDataCache.has(work.id)
  const shouldFetchWork = activeWorkId === work.id && !isWorkCached

  // ────────── デバウンス処理 ──────────
  const debouncedSetActiveWork = useCallback((workId: string) => {
    setIsDebouncing(true)

    // 既存のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 新しいタイマーを設定
    debounceTimerRef.current = setTimeout(() => {
      setActiveWorkId(workId)
      setIsDebouncing(false)
      debounceTimerRef.current = null
    }, 500) // 500ms のデバウンス
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const listEl = thumbListRef.current
      if (!listEl) return

      const target = listEl.children[index] as HTMLElement | undefined
      if (!target) return

      // 初回だけは一瞬で位置合わせ・以後は smooth
      scrollItemIntoVerticalCenter(
        listEl,
        target,
        /* smooth = */ isFirstScrollDone.current,
      )

      // 1 回実行したらフラグを立てて smooth に切り替え
      if (!isFirstScrollDone.current) isFirstScrollDone.current = true
    }, 100)
  }, [index, works.length, startWorkId, startIndex, initialIndex])

  // ────────── インデックス変更時の処理 ──────────
  useEffect(() => {
    const currentWork = works[index]
    if (currentWork) {
      // キャッシュ済みの場合は即座に表示
      if (workDataCache.has(currentWork.id)) {
        setActiveWorkId(currentWork.id)
        setIsDebouncing(false)
        // タイマーをクリア
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }
      } else {
        // キャッシュされていない場合はデバウンス
        debouncedSetActiveWork(currentWork.id)
      }
    }
  }, [index, works, workDataCache, debouncedSetActiveWork])

  // ────────── GraphQL Query with conditional execution ──────────
  const { data, loading, error } = useQuery(workDialogQuery, {
    variables: { workId: work.id },
    skip: !shouldFetchWork, // デバウンス完了 & 未キャッシュの場合のみ実行
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
    onCompleted: (data) => {
      if (data?.work) {
        // データが取得できたらキャッシュに保存
        setWorkDataCache((prev) => new Map(prev).set(work.id, data.work))
        setLoadedWorkIds((prev) => new Set(prev).add(work.id))
      }
    },
  })

  // ────────── 先読み処理（デバウンス付き） ──────────
  const prefetchAdjacentWorks = useCallback(() => {
    // 現在の作品が読み込み完了してから先読み開始
    if (isDebouncing || (!isWorkCached && !data?.work)) return

    const prefetchIds: string[] = []

    // 前後2作品の範囲で先読み（負荷軽減のため範囲を縮小）
    for (
      let i = Math.max(0, index - 2);
      i <= Math.min(works.length - 1, index + 2);
      i++
    ) {
      if (i !== index && !loadedWorkIds.has(works[i].id)) {
        prefetchIds.push(works[i].id)
      }
    }

    // 先読み実行（さらに遅延を追加）
    prefetchIds.forEach((workId, idx) => {
      setTimeout(
        () => {
          if (!workDataCache.has(workId)) {
            setActiveWorkId(workId)
          }
        },
        1000 + idx * 500,
      ) // 1秒後から0.5秒間隔で先読み
    })
  }, [
    index,
    works,
    loadedWorkIds,
    workDataCache,
    isDebouncing,
    isWorkCached,
    data,
  ])

  // ────────── 先読みのトリガー（遅延実行） ──────────
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      prefetchAdjacentWorks()
    }, 1500) // 1.5秒後に先読み開始

    return () => clearTimeout(timeoutId)
  }, [prefetchAdjacentWorks])

  // ────────── 現在表示する作品データの決定 ──────────
  const currentWork = useMemo(() => {
    // キャッシュからデータを取得
    const cachedData = workDataCache.get(work.id)
    if (cachedData) {
      return cachedData
    }

    // キャッシュにない場合はAPIからのデータまたは基本データを使用
    return data?.work ?? work
  }, [work, workDataCache, data])

  // ────────── index が末尾なら自動ロード ──────────
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
      const activeElement = document.activeElement
      const tagName = activeElement?.tagName.toLowerCase()
      const isInputFocused =
        tagName === "input" ||
        tagName === "textarea" ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        activeElement?.getAttribute("role") === "textbox"

      // 入力欄にフォーカスしている場合は処理を停止
      if (isInputFocused) {
        return
      }

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

  // ────────── クリーンアップ ──────────
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // ────────── ローディング状態 ──────────
  const isCurrentWorkLoading = (!isWorkCached && loading) || isDebouncing

  // ───────────────── Render ─────────────────
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] w-[100vw] max-w-[100vw] overflow-hidden p-0">
        {/* 詳細パネル (Desktop) */}
        <aside className="hidden w-full flex-col bg-background/80 backdrop-blur-sm md:flex">
          <DialogHeader className="border-b p-4 pb-2">
            <DialogTitle className="truncate font-bold text-lg">
              <Link to={`/posts/${currentWork.id}`}>{currentWork.title}</Link>
            </DialogTitle>
            <div className="mt-2">
              <Link
                to={`/users/${currentWork.user?.login}`}
                className="flex items-center space-x-2"
              >
                <Avatar className="size-6">
                  <AvatarImage
                    src={withIconUrlFallback(currentWork.user?.iconUrl)}
                  />
                  <AvatarFallback />
                </Avatar>
                <span className="font-medium text-sm">
                  {currentWork.user?.name}
                </span>
              </Link>
            </div>
          </DialogHeader>

          {/* ローディング表示 */}
          {isCurrentWorkLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span className="text-muted-foreground text-sm">
                  {isDebouncing ? "待機中..." : "読み込み中..."}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-y-6 overflow-y-auto overscroll-y-contain p-4">
              <WorkArticle
                work={{
                  ...currentWork,
                  user: currentWork.user
                    ? { ...currentWork.user, works: [] }
                    : null,
                  nextWork: null,
                  previousWork: null,
                }}
                userSetting={undefined}
                mode={"dialog"}
              />
              <WorkCommentList
                workId={currentWork.id}
                workOwnerIconImageURL={withIconUrlFallback(
                  currentWork.user?.iconUrl,
                )}
                isWorkOwnerBlocked={currentWork.user?.isBlocked ?? false}
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
          )}
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
              className={`relative m-1 rounded-md ring-offset-2 focus:outline-none focus:ring-2 ${
                i === index ? "ring ring-primary" : ""
              }`}
              onClick={() => setIndex(i)}
            >
              <img
                src={w.smallThumbnailImageURL}
                alt={w.title}
                className="h-20 w-full rounded-md object-cover"
                draggable={false}
              />
              {/* キャッシュ済みインジケーター */}
              {loadedWorkIds.has(w.id) && (
                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
              {/* デバウンス中インジケーター */}
              {isDebouncing && i === index && (
                <div className="absolute top-1 left-1 h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
              )}
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

// GraphQL部分は変更なし
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
    promptonUser {
      id
    }
  }
  likedUsers(offset: 0, limit: 8) {
    id
    name
    iconUrl
    login
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
