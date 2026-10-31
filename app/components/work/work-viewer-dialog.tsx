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
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"
import { WorkArticle } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkCommentSectionEnhanced } from "~/components/work/work-comment-section-final"
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
): void {
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
}: Props): React.ReactNode {
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
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 作品を切り替えたら本文を先頭から見せる
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [index])
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

      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault() // 背景のスクロールを防ぐ
        e.stopPropagation() // イベントの伝播を停止
        prev()
      }
      if (e.key === "ArrowDown" || e.key === "j") {
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

  // 作品を切り替えたら本文のスクロールを先頭に戻す
  const commentsOf = (target: typeof currentWork) => {
    const currentWork = target
    return (
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
    )
  }

  const hasPrev = index > 0
  const hasNext = index < works.length - 1 || hasNextPage

  // ───────────────── Render ─────────────────
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="top-0 left-0 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:top-0 sm:translate-y-0 md:top-[50%] md:left-[50%] md:h-[94vh] md:translate-x-[-50%] md:translate-y-[-50%] md:max-h-[94vh] md:w-[96vw] md:max-w-[1400px] md:rounded-xl md:border [&>button.absolute]:hidden"
      >
        {/* 上のバー: 閉じる・作者・タイトル・何作品目か・作品ページへ */}
        <DialogHeader className="flex shrink-0 flex-row items-center gap-2 space-y-0 border-b px-2 py-2 text-left md:px-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            aria-label="閉じる"
            className="shrink-0"
          >
            <X className="size-5" />
          </Button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = `/users/${currentWork.user?.login}`
              }
            }}
            className="flex min-w-0 shrink-0 items-center gap-2 rounded-full bg-transparent py-1 pr-2 text-left transition-colors hover:bg-muted"
          >
            <Avatar className="size-8">
              <AvatarImage
                src={withIconUrlFallback(currentWork.user?.iconUrl)}
              />
              <AvatarFallback />
            </Avatar>
            <span className="hidden max-w-40 truncate font-medium text-sm sm:inline">
              {currentWork.user?.name}
            </span>
          </button>
          <DialogTitle className="min-w-0 flex-1 truncate font-bold text-base">
            {currentWork.title}
          </DialogTitle>
          <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
            {index + 1} / {works.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="hidden shrink-0 gap-1 md:inline-flex"
            onClick={() => {
              // Portal内でReact Routerが使用できないため、直接ナビゲーション
              if (typeof window !== "undefined") {
                window.location.href = `/posts/${currentWork.id}`
              }
            }}
          >
            作品ページ
            <ExternalLink className="size-3.5" />
          </Button>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1">
          {/* 本文（画像・説明・コメント） */}
          <div
            ref={contentRef}
            className="min-w-0 flex-1 overflow-y-auto overscroll-y-contain"
          >
            {isCurrentWorkLoading ? (
              <div className="flex h-full items-center justify-center p-4">
                <div className="relative">
                  <img
                    src={work.smallThumbnailImageURL}
                    alt={work.title}
                    className="max-h-[60vh] max-w-full rounded-lg object-contain opacity-60 blur-[2px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-4 border-white/80 border-t-transparent" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-5xl p-3 pb-24 md:px-16 md:py-6">
                <WorkArticle
                  work={{
                    ...currentWork,
                    isBotGradingEnabled:
                      (
                        currentWork as unknown as {
                          isBotGradingEnabled?: boolean
                        }
                      ).isBotGradingEnabled ?? false,
                    isBotGradingPublic:
                      (
                        currentWork as unknown as {
                          isBotGradingPublic?: boolean
                        }
                      ).isBotGradingPublic ?? false,
                    botEvaluation: ((currentWork as any).botEvaluation ??
                      null) as any,
                    user: currentWork.user
                      ? { ...currentWork.user, works: [] }
                      : null,
                    nextWork: null,
                    previousWork: null,
                  }}
                  userSetting={undefined}
                  mode={"dialog"}
                />
                {/* コメント（入力欄も一覧の下に置き、画像の表示を狭めない） */}
                {currentWork.isCommentsEditable && (
                  <div className="mt-6">
                    <WorkCommentSectionEnhanced
                      key={currentWork.id}
                      workId={currentWork.id}
                      workOwnerIconImageURL={withIconUrlFallback(
                        currentWork.user?.iconUrl,
                      )}
                      isWorkOwnerBlocked={
                        (currentWork as { user?: { isBlocked?: boolean } })
                          .user?.isBlocked ?? false
                      }
                      isFixedInput={false}
                      comments={commentsOf(currentWork)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PC: 前後の作品へ（本文の左右に重ねる） */}
          <Button
            variant="secondary"
            size="icon"
            aria-label="前の作品"
            onClick={prev}
            disabled={!hasPrev}
            className="-translate-y-1/2 absolute top-1/2 left-3 z-10 hidden size-11 rounded-full shadow-md disabled:opacity-0 md:inline-flex"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="次の作品"
            onClick={next}
            disabled={!hasNext}
            className="-translate-y-1/2 absolute top-1/2 right-[7.5rem] z-10 hidden size-11 rounded-full shadow-md disabled:opacity-0 md:inline-flex"
          >
            <ChevronRight className="size-6" />
          </Button>
          <p className="pointer-events-none absolute bottom-3 left-3 z-10 hidden rounded-full bg-background/80 px-3 py-1 text-muted-foreground text-xs shadow-sm backdrop-blur md:block">
            ↑ ↓（J / K）キーで前後の作品
          </p>

          {/* PC: 一覧の作品（右の列） */}
          <aside
            ref={thumbListRef}
            className="hidden w-28 shrink-0 flex-col gap-2 overflow-y-auto overscroll-y-contain border-l bg-muted/30 p-2 md:flex"
            style={{ scrollbarWidth: "thin" }}
          >
            {works.map((w, i) => (
              <button
                key={w.id}
                type="button"
                aria-label={w.title}
                aria-current={i === index}
                className={`relative shrink-0 overflow-hidden rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  i === index
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setIndex(i)}
              >
                <img
                  src={w.smallThumbnailImageURL}
                  alt=""
                  className="aspect-square w-full bg-muted object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </button>
            ))}
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            )}
            <div ref={sentinelRef} className="h-[2px] w-full" />
          </aside>
        </div>

        {/* スマホ: 下のバー（前の作品・いいね・次の作品） */}
        <div className="flex shrink-0 items-center gap-2 border-t bg-background/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <Button
            variant="outline"
            onClick={prev}
            disabled={!hasPrev}
            className="h-11 shrink-0 gap-1 px-3"
            aria-label="前の作品"
          >
            <ChevronLeft className="size-5" />
            前
          </Button>
          <div className="min-w-0 flex-1">
            <WorkActionContainer
              accessType={currentWork.accessType}
              workLikesCount={currentWork.likesCount}
              title={currentWork.title}
              description=""
              currentImageUrl={currentWork.imageURL}
              imageUrls={[currentWork.imageURL]}
              targetWorkId={currentWork.id}
              bookmarkFolderId={null}
              defaultLiked={currentWork.isLiked}
              defaultBookmarked={currentWork.isBookmarked}
              targetWorkOwnerUserId={currentWork.user?.id ?? ""}
              isRecommended={currentWork.isMyRecommended}
              isDisabledShare={false}
              isSensitive={currentWork.isSensitive}
              isTargetUserBlocked={Boolean(currentWork.user?.isBlocked)}
              workType={currentWork.type}
              mode="dialogLikeOnly"
            />
          </div>
          <Button
            variant="outline"
            onClick={next}
            disabled={!hasNext}
            className="h-11 shrink-0 gap-1 px-3"
            aria-label="次の作品"
          >
            次
            <ChevronRight className="size-5" />
          </Button>
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
  streamUid
  isDeleted
  user {
    id
    biography
    enBiography
    login
    nanoid
    name
    isOfficial
    isModerator
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
    isOfficial
    isModerator
    iconUrl
    avatarFrame {
      id
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
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
