import { useCallback, useEffect, useRef, useState, useMemo } from "react"
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
import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { WorkArticle } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkCommentSectionEnhanced } from "~/components/work/work-comment-section-final"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
// Note: Linkコンポーネントは使用しない（Portal内でReact Routerコンテキストが使用できないため）

// ───────────────── Types ─────────────────
type Comment = {
  id: string
  user?: {
    id: string
    name: string
    iconUrl?: string | null
  }
  text?: string | null
  createdAt: number
  likesCount: number
  isLiked: boolean
  isWorkOwnerLiked: boolean
  isMuted?: boolean
  isSensitive?: boolean
  sticker?: {
    id: string
    title: string
    imageUrl?: string | null
    accessType: string
    isDownloaded?: boolean
  }
  responses?: Comment[] | null
}

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
      console.log(
        "🔍 startWorkId:",
        startWorkId,
        "found at index:",
        idx,
        "work:",
        works[idx]?.id,
      )
      if (idx !== -1) return idx
    }
    const fallbackIndex = startIndex ?? 0
    console.log(
      "🔍 fallback index:",
      fallbackIndex,
      "work:",
      works[fallbackIndex]?.id,
    )
    return fallbackIndex
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
  const isInitialized = useRef(false)

  // 初期化時に正しい作品IDとインデックスを確実に設定（一回のみ）
  useEffect(() => {
    if (isInitialized.current) return // 既に初期化済みの場合はスキップ

    const targetWork = works[initialIndex]
    console.log(
      "🎯 Initializing with index:",
      initialIndex,
      "work ID:",
      targetWork?.id,
    )

    if (targetWork) {
      // インデックスも確実に初期値に設定
      setIndex(initialIndex)
      // 対応する作品IDも設定
      if (activeWorkId !== targetWork.id) {
        setActiveWorkId(targetWork.id)
      }
      isInitialized.current = true // 初期化完了をマーク
    }
  }, [initialIndex]) // worksとactiveWorkIdを依存配列から除去

  // startWorkIdが変わった場合は再初期化を許可
  useEffect(() => {
    isInitialized.current = false
  }, [startWorkId])

  const thumbListRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ────────── 現在の作品 ──────────
  const work = works[index]
  const isWorkCached = workDataCache.has(work.id)
  const shouldFetchWork = activeWorkId === work.id && !isWorkCached

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
        // 初回表示または未キャッシュの場合
        const isInitial = activeWorkId === null
        setIsDebouncing(true)

        // 既存のタイマーをクリア
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        // デバウンス時間をさらに最適化（初回は即座、以降は短く）
        const debounceTime = isInitial ? 0 : 200

        debounceTimerRef.current = setTimeout(() => {
          setActiveWorkId(currentWork.id)
          setIsDebouncing(false)
          debounceTimerRef.current = null
        }, debounceTime)
      }
    }
  }, [index, works, workDataCache])

  // ────────── GraphQL Query with conditional execution ──────────
  const { data, loading } = useQuery(workDialogQuery, {
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
    () => setIndex((i) => (i > 0 ? i - 1 : i)),
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

      if (e.key === "ArrowUp") {
        e.preventDefault() // 背景のスクロールを防ぐ
        e.stopPropagation() // イベントの伝播を停止
        prev()
      }
      if (e.key === "ArrowDown") {
        e.preventDefault() // 背景のスクロールを防ぐ
        e.stopPropagation() // イベントの伝播を停止
        next()
      }
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKey)
    // ホイールイベントリスナーを削除（サムネイル一覧のスクロールによる自動切り替えを防ぐ）
    return () => {
      window.removeEventListener("keydown", onKey)
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
      <DialogContent className="flex h-[90vh] w-[100vw] max-w-[88vw] overflow-hidden p-0">
        {/* 詳細パネル (Desktop + Mobile) */}
        <aside className="flex w-full flex-col bg-background/80 backdrop-blur-sm">
          <DialogHeader className="border-b p-4 pb-2">
            {/* モバイル用ナビゲーション */}
            <div className="flex items-center justify-between md:hidden">
              <Button
                onClick={prev}
                variant="ghost"
                size="sm"
                disabled={index === 0}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {index + 1} / {works.length}
              </span>
              <Button
                onClick={next}
                variant="ghost"
                size="sm"
                disabled={index === works.length - 1}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogTitle className="text-lg font-bold truncate">
              {/* タイトルはデスクトップのみ */}
              <span
                className="hidden md:inline cursor-pointer text-left transition-colors hover:text-primary"
                onClick={() => {
                  // Portal内でReact Routerが使用できないため、直接ナビゲーション
                  if (typeof window !== "undefined") {
                    window.location.href = `/posts/${currentWork.id}`
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    if (typeof window !== "undefined") {
                      window.location.href = `/posts/${currentWork.id}`
                    }
                  }
                }}
              >
                {currentWork.title}
              </span>
              {/* モバイル用簡潔タイトル */}
              <span className="md:hidden truncate">{currentWork.title}</span>
            </DialogTitle>
            <div className="mt-2">
              <span
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/users/${currentWork.user?.login}`
                  }
                }}
                className="flex cursor-pointer items-center space-x-2 transition-colors hover:text-primary"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    if (typeof window !== "undefined") {
                      window.location.href = `/users/${currentWork.user?.login}`
                    }
                  }
                }}
              >
                <Avatar className="size-6">
                  <AvatarImage
                    src={withIconUrlFallback(currentWork.user?.iconUrl)}
                  />
                  <AvatarFallback />
                </Avatar>
                <span className="text-sm font-medium">
                  {currentWork.user?.name}
                </span>
              </span>
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
            <div className="flex flex-1 flex-col gap-y-6 overflow-y-auto overscroll-y-contain p-4 pb-8">
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
              {/* コメント欄はisCommentsEditableがtrueの場合のみ表示 */}
              {currentWork.isCommentsEditable && (
                <div className="pb-4">
                  <WorkCommentSectionEnhanced
                    workId={currentWork.id}
                    workOwnerIconImageURL={withIconUrlFallback(
                      currentWork.user?.iconUrl,
                    )}
                    isWorkOwnerBlocked={currentWork.user?.isBlocked ?? false}
                    comments={
                      Array.isArray(
                        (currentWork as { comments?: unknown[] }).comments,
                      )
                        ? (currentWork as { comments: Comment[] }).comments.map(
                            (c) => ({
                              id: c.id,
                              text: c.text,
                              createdAt: c.createdAt,
                              likesCount: c.likesCount,
                              isLiked: c.isLiked,
                              isWorkOwnerLiked: c.isWorkOwnerLiked,
                              isMuted: c.isMuted,
                              isSensitive: c.isSensitive,
                              user: c.user
                                ? {
                                    id: c.user.id,
                                    name: c.user.name || "",
                                    iconUrl: c.user.iconUrl,
                                  }
                                : undefined,
                              sticker: c.sticker
                                ? {
                                    id: c.sticker.id || "",
                                    title: c.sticker.title || "",
                                    imageUrl: c.sticker.imageUrl,
                                    accessType:
                                      c.sticker.accessType || "PUBLIC",
                                    isDownloaded: c.sticker.isDownloaded,
                                  }
                                : undefined,
                              responses: null,
                            }),
                          )
                        : []
                    }
                  />
                </div>
              )}
            </div>
          )}
        </aside>

        {/* サムネイル列 */}
        <aside
          ref={thumbListRef}
          className="ml-auto flex h-full w-16 flex-col overflow-y-auto overscroll-y-contain bg-background/80 backdrop-blur-sm md:w-24"
          style={{ scrollbarWidth: "thin" }}
        >
          {works.map((w, i) => (
            <button
              key={w.id}
              type="button"
              className={`relative m-1 rounded-md transition-all duration-200 ring-offset-2 focus:outline-none focus:ring-2 ${
                i === index
                  ? "bg-primary/10 ring ring-primary"
                  : "hover:bg-background/20"
              }`}
              onClick={() => setIndex(i)}
            >
              <img
                src={w.smallThumbnailImageURL}
                alt={w.title}
                className="h-14 w-full rounded-md object-cover md:h-20"
                draggable={false}
                loading="lazy"
              />
              {/* キャッシュ済みインジケーター */}
              {loadedWorkIds.has(w.id) && (
                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-400 shadow-sm" />
              )}
              {/* デバウンス中インジケーター */}
              {isDebouncing && i === index && (
                <div className="absolute top-1 left-1 h-2 w-2 animate-pulse rounded-full bg-yellow-400 shadow-sm" />
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
