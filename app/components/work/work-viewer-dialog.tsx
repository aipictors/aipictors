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
import { WorkCommentInputFixed } from "~/components/work/work-comment-input-fixed"
import { WorkActionContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-action-container"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
// Note: Linkコンポーネントは使用しない（Portal内でReact Routerコンテキストが使用できないため）

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
    const fallbackIndex = startIndex ?? 0
    return fallbackIndex
  }, [startWorkId, startIndex, works])

  const [index, setIndex] = useState(initialIndex)
  const [loadedWorkIds, setLoadedWorkIds] = useState<Set<string>>(new Set())
  const [workDataCache, setWorkDataCache] = useState<Map<string, unknown>>(
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
  const isWorkCached = work ? workDataCache.has(work.id) : false
  const shouldFetchWork = work && activeWorkId === work.id && !isWorkCached

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
  const { data, loading, refetch } = useQuery(workDialogQuery, {
    variables: { workId: work?.id || "" },
    skip: !shouldFetchWork || !work, // workが存在しない場合もスキップ
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    returnPartialData: true,
    onCompleted: (data) => {
      if (data?.work && work) {
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
      const workItem = works[i]
      if (workItem && i !== index && !loadedWorkIds.has(workItem.id)) {
        prefetchIds.push(workItem.id)
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
    if (!work) return null

    // キャッシュからデータを取得
    const cachedData = workDataCache.get(work.id)
    if (cachedData) {
      return cachedData as typeof work
    }

    // キャッシュにない場合はAPIからのデータまたは基本データを使用
    return (data?.work as typeof work) ?? work
  }, [work, workDataCache, data])

  // ────────── コメント送信後の処理 ──────────
  const handleCommentAdded = useCallback(async () => {
    if (!work) return

    try {
      // データを再取得してキャッシュを更新
      const result = await refetch()
      if (result.data?.work) {
        setWorkDataCache((prev) => new Map(prev).set(work.id, result.data.work))
      }
    } catch (error) {
      console.error("Failed to refetch comments:", error)
    }
  }, [refetch, work])

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

  // ────────── 安全性チェック ──────────
  if (!work || !currentWork) {
    console.error(
      "Work not found at index:",
      index,
      "Works length:",
      works.length,
    )
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="flex h-[90vh] w-[100vw] max-w-[88vw] overflow-hidden p-0">
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">作品が見つかりませんでした</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ───────────────── Render ─────────────────
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="h-[96vh] w-[100vw] max-w-[95vw] overflow-hidden p-0 sm:max-w-[88vw]">
        <div className="flex h-[88vh] w-[100vw] max-w-[95vw] overflow-hidden p-0 sm:max-w-[88vw]">
          {/* 詳細パネル (Desktop + Mobile) */}
          <aside
            className="flex flex-col bg-background/80 backdrop-blur-sm"
            style={{
              width: "calc(100% - 5rem)",
              minWidth: "calc(100% - 5rem)",
              maxWidth: "calc(100% - 5rem)",
            }}
          >
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
                <span className="text-muted-foreground text-xs">
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
              <DialogTitle className="truncate font-bold text-lg">
                {/* タイトルはデスクトップのみ */}
                <span
                  className="hidden cursor-pointer text-left transition-colors hover:text-primary md:inline"
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
                <span className="truncate md:hidden">{currentWork.title}</span>
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
                  <span className="font-medium text-sm">
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
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* メインコンテンツエリア（スクロール可能） */}
                <div className="flex-1 overflow-y-auto overscroll-y-contain p-4">
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
                  {/* コメント一覧（コメントが有効な場合のみ） */}
                  {currentWork.isCommentsEditable && (
                    <div className="mt-6">
                      <WorkCommentSectionEnhanced
                        workId={currentWork.id}
                        workOwnerIconImageURL={withIconUrlFallback(
                          currentWork.user?.iconUrl,
                        )}
                        isWorkOwnerBlocked={
                          (currentWork as { user?: { isBlocked?: boolean } })
                            .user?.isBlocked ?? false
                        }
                        isFixedInput={true}
                        comments={
                          Array.isArray(
                            (currentWork as unknown as { comments?: unknown[] })
                              .comments,
                          )
                            ? (
                                currentWork as unknown as {
                                  comments: unknown[]
                                }
                              ).comments.map((c: unknown) => ({
                                id: (c as { id: string }).id,
                                text: (c as { text?: string | null }).text,
                                createdAt: (c as { createdAt: number })
                                  .createdAt,
                                likesCount: (c as { likesCount: number })
                                  .likesCount,
                                isLiked: (c as { isLiked: boolean }).isLiked,
                                isWorkOwnerLiked: (
                                  c as { isWorkOwnerLiked: boolean }
                                ).isWorkOwnerLiked,
                                isMuted: (c as { isMuted?: boolean }).isMuted,
                                isSensitive: (c as { isSensitive?: boolean })
                                  .isSensitive,
                                user: (
                                  c as {
                                    user?: {
                                      id: string
                                      name: string
                                      iconUrl?: string | null
                                    }
                                  }
                                ).user
                                  ? {
                                      id: (c as { user: { id: string } }).user
                                        .id,
                                      name:
                                        (c as { user: { name: string } }).user
                                          .name || "",
                                      iconUrl: (
                                        c as {
                                          user: { iconUrl?: string | null }
                                        }
                                      ).user.iconUrl,
                                    }
                                  : undefined,
                                sticker: (
                                  c as {
                                    sticker?: {
                                      id: string
                                      title: string
                                      imageUrl?: string | null
                                      accessType: string
                                      isDownloaded?: boolean
                                    }
                                  }
                                ).sticker
                                  ? {
                                      id:
                                        (c as { sticker: { id: string } })
                                          .sticker.id || "",
                                      title:
                                        (c as { sticker: { title: string } })
                                          .sticker.title || "",
                                      imageUrl: (
                                        c as {
                                          sticker: { imageUrl?: string | null }
                                        }
                                      ).sticker.imageUrl,
                                      accessType:
                                        (
                                          c as {
                                            sticker: { accessType: string }
                                          }
                                        ).sticker.accessType || "PUBLIC",
                                      isDownloaded: (
                                        c as {
                                          sticker: { isDownloaded?: boolean }
                                        }
                                      ).sticker.isDownloaded,
                                    }
                                  : undefined,
                                responses: [],
                              }))
                            : []
                        }
                      />
                    </div>
                  )}
                </div>

                {/* 固定アクションエリア（コメント入力） */}
                <div className="border-t bg-background/98 backdrop-blur-md">
                  {/* 固定コメント入力欄 */}
                  {currentWork.isCommentsEditable && (
                    <WorkCommentInputFixed
                      workId={currentWork.id}
                      isWorkOwnerBlocked={
                        (currentWork as { user?: { isBlocked?: boolean } }).user
                          ?.isBlocked ?? false
                      }
                      commentsCount={
                        Array.isArray(
                          (currentWork as unknown as { comments?: unknown[] })
                            .comments,
                        )
                          ? (currentWork as unknown as { comments: unknown[] })
                              .comments.length
                          : 0
                      }
                      onCommentAdded={handleCommentAdded}
                    />
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* サムネイル列 - スマホでも常に表示（幅固定） */}
          <aside
            ref={thumbListRef}
            className="ml-auto flex h-full flex-col overflow-y-auto overscroll-y-contain bg-background/80 backdrop-blur-sm"
            style={{
              width: "5rem", // 固定幅
              minWidth: "5rem", // 最小幅
              maxWidth: "5rem", // 最大幅
              scrollbarWidth: "thin",
              display: "flex",
              visibility: "visible",
              opacity: 1,
            }}
          >
            {works.map((w, i) => (
              <button
                key={w.id}
                type="button"
                className={`relative m-1 rounded-md ring-offset-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  i === index
                    ? "bg-primary/10 ring ring-primary"
                    : "hover:bg-background/20"
                }`}
                onClick={() => setIndex(i)}
              >
                <img
                  src={w.smallThumbnailImageURL}
                  alt={w.title}
                  className="h-16 w-full rounded-md object-cover"
                  draggable={false}
                  loading="lazy"
                  onLoad={(e) => {
                    // 画像読み込み完了時にサムネイル幅の安定化
                    const img = e.target as HTMLImageElement
                    img.style.opacity = "1"
                  }}
                  onError={(e) => {
                    // エラー時もサイズを維持
                    const img = e.target as HTMLImageElement
                    img.style.opacity = "0.5"
                  }}
                  style={{
                    width: "100%",
                    height: "4rem",
                    objectFit: "cover",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                  }}
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
        </div>
        {/* いいねボタンエリア - フル幅有効領域 */}
        <div className="border-t bg-background/95 backdrop-blur-sm">
          <div className="w-full">
            <WorkActionContainer
              workLikesCount={currentWork.likesCount}
              title={currentWork.title}
              description={
                (currentWork.description?.length ?? 0) > 100
                  ? `${currentWork.description?.slice(0, 100)}...`
                  : (currentWork.description ?? "")
              }
              currentImageUrl={currentWork.imageURL}
              imageUrls={[
                currentWork.imageURL,
                ...(currentWork.subWorks || []).map(
                  (subWork) => subWork.imageUrl ?? "",
                ),
              ]}
              targetWorkId={currentWork.id}
              bookmarkFolderId={null}
              targetWorkOwnerUserId={currentWork.user?.id ?? ""}
              isDisabledShare={false}
              isTargetUserBlocked={Boolean(currentWork.user?.isBlocked)}
              mode="dialogLikeOnly"
            />
          </div>
        </div>
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
  isBotGradingEnabled
  isBotGradingPublic
  botEvaluation {
    cutenessScore
    coolnessScore
    beautyScore
    originalityScore
    compositionScore
    colorScore
    detailScore
    consistencyScore
    overallScore
    comment
    personality
  }
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
