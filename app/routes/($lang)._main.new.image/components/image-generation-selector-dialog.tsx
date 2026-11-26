import { useApolloClient, useQuery } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog"
import { Slider } from "~/components/ui/slider"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { GenerationResultParams } from "~/routes/($lang)._main.new.image/utils/to-generation-image-information"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { getBase64FromImageUrl } from "~/utils/get-base64-from-image-url"

type Props = {
  onSubmit: (
    selectedImage: string[],
    selectedIds: string[],
    lastSelectedOriginalImage: string,
    lastSelectedResult: GenerationResultParams | null,
    selectedNanoids: string[],
  ) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  /** 投稿の画像一覧にもう入っている生成画像の nanoid（「追加済み」にして選べなくする） */
  addedNanoids?: string[]
}

type GenerationResult = NonNullable<
  ResultOf<typeof viewerImageGenerationResultsQuery>["viewer"]
>["imageGenerationResults"][number]

const PAGE_SIZE = 60

/** サムネイルの大きさ（一覧の 1 枚の最小の幅 px） */
const THUMBNAIL_SIZES = [72, 100, 140, 200, 280]
const DEFAULT_SIZE_INDEX = 1
const SIZE_KEY = "generation-selector-size"
const FIT_KEY = "generation-selector-fit"

const getSourceUrl = (result: GenerationResult) =>
  result.imageUrl || result.thumbnailUrl || null

/**
 * 投稿画面: 生成履歴から画像を選ぶ
 * - 一覧の大きさを変えられる（端末に保存）・切り抜かずに全体を表示できる
 * - 虫めがねで大きく見て、そのまま選べる（左右で前後の画像）
 * - 選んだ画像はすぐに裏で読み始めるので、追加を押してから待たない
 * - 1 枚読めなくても、読めた画像は追加する
 * - もう追加した画像は「追加済み」にして選べなくする（同じ画像を二重に足さない）
 */
export function ImageGenerationSelectorDialog(props: Props) {
  const t = useTranslation()
  const client = useApolloClient()

  // 開いたときに取り直す（開いた後に生成した画像も出す。ログインの前に取って空のままにならないよう、開くまでは取らない）
  // 一度開いたら取ったままにする（閉じる途中で一覧が消えないように）
  const [hasOpened, setHasOpened] = useState(false)
  useEffect(() => {
    if (props.isOpen) setHasOpened(true)
  }, [props.isOpen])

  const { data, loading, error, refetch } = useQuery(
    viewerImageGenerationResultsQuery,
    {
      skip: !props.isOpen && !hasOpened,
      variables: { limit: PAGE_SIZE, offset: 0, where: {} },
      fetchPolicy: "cache-and-network",
    },
  )

  const [extraResults, setExtraResults] = useState<GenerationResult[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const firstPage = data?.viewer?.imageGenerationResults ?? []
  const results: GenerationResult[] = []
  const seenIds = new Set<string>()
  for (const result of [...firstPage, ...extraResults]) {
    if (seenIds.has(result.id)) continue
    seenIds.add(result.id)
    results.push(result)
  }

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const addedNanoids = new Set(props.addedNanoids ?? [])
  const isAdded = (result: GenerationResult) =>
    result.nanoid !== null && addedNanoids.has(result.nanoid)
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_SIZE_INDEX)
  const [isContain, setIsContain] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const isSubmitting = progress !== null

  // 選んだ画像の読み込み（1 枚ずつ。同時に変換するとスマートフォンで落ちる）
  const loadQueueRef = useRef<Promise<unknown>>(Promise.resolve())
  const loadedRef = useRef(new Map<string, Promise<string>>())

  useEffect(() => {
    const storedSize = Number(localStorage.getItem(SIZE_KEY))
    if (Number.isInteger(storedSize) && THUMBNAIL_SIZES[storedSize]) {
      setSizeIndex(storedSize)
    }
    setIsContain(localStorage.getItem(FIT_KEY) === "contain")
  }, [])

  // 開くたびに続きのページと前回の選択を空にする
  useEffect(() => {
    if (!props.isOpen) return
    setExtraResults([])
    setHasMore(true)
    setSelectedIds([])
    setPreviewId(null)
    loadedRef.current.clear()
    if (data !== undefined) void refetch()
  }, [props.isOpen])

  useEffect(() => {
    if (firstPage.length > 0 && firstPage.length < PAGE_SIZE) setHasMore(false)
  }, [firstPage.length])

  const changeSize = (index: number) => {
    const next = Math.min(THUMBNAIL_SIZES.length - 1, Math.max(0, index))
    setSizeIndex(next)
    localStorage.setItem(SIZE_KEY, String(next))
  }

  const toggleFit = () => {
    setIsContain((prev) => {
      localStorage.setItem(FIT_KEY, prev ? "cover" : "contain")
      return !prev
    })
  }

  /** 画像を投稿用の data URL にする。元の画像が読めないときはサムネイルで */
  const loadImage = (result: GenerationResult) => {
    const cached = loadedRef.current.get(result.id)
    if (cached) return cached
    const task = loadQueueRef.current.then(async () => {
      const urls = [result.imageUrl, result.thumbnailUrl].filter(
        (url): url is string => Boolean(url),
      )
      let lastError: unknown = new Error("no image url")
      for (const url of urls) {
        try {
          return await getBase64FromImageUrl(url, "image/webp")
        } catch (error) {
          lastError = error
        }
      }
      throw lastError
    })
    // 失敗しても後ろの読み込みは続ける
    loadQueueRef.current = task.catch(() => {})
    // 失敗したものは、もう一度押したときに読み直す
    task.catch(() => {
      if (loadedRef.current.get(result.id) === task) {
        loadedRef.current.delete(result.id)
      }
    })
    loadedRef.current.set(result.id, task)
    return task
  }

  const toggleSelect = (result: GenerationResult) => {
    if (isSubmitting || getSourceUrl(result) === null || isAdded(result)) {
      return
    }
    if (selectedIds.includes(result.id)) {
      setSelectedIds((prev) => prev.filter((id) => id !== result.id))
      return
    }
    setSelectedIds((prev) => [...prev, result.id])
    // 追加を押す前に裏で読み始める
    void loadImage(result).catch(() => {})
  }

  const loadMore = async () => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const response = await client.query({
        query: viewerImageGenerationResultsQuery,
        variables: {
          limit: PAGE_SIZE,
          offset: firstPage.length + extraResults.length,
          where: {},
        },
        fetchPolicy: "network-only",
      })
      const page = response.data?.viewer?.imageGenerationResults ?? []
      setExtraResults((prev) => [...prev, ...page])
      if (page.length < PAGE_SIZE) setHasMore(false)
    } catch (loadError) {
      console.error(loadError)
      toast(t("読み込めませんでした", "Failed to load"))
    } finally {
      setIsLoadingMore(false)
    }
  }

  const close = () => {
    if (isSubmitting) return
    props.setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    if (selectedIds.length === 0) {
      close()
      return
    }

    const selected = selectedIds.flatMap((id) => {
      const result = results.find((r) => r.id === id)
      return result && !isAdded(result) ? [result] : []
    })

    setProgress({ done: 0, total: selected.length })
    const images: string[] = []
    const okResults: GenerationResult[] = []
    for (const [index, result] of selected.entries()) {
      try {
        images.push(await loadImage(result))
        okResults.push(result)
      } catch (loadError) {
        console.error(loadError)
      }
      setProgress({ done: index + 1, total: selected.length })
    }
    setProgress(null)

    if (okResults.length === 0) {
      toast.error(
        t(
          "画像を読み込めませんでした。通信の良い所でもう一度お試しください",
          "Couldn't load the images. Please try again with a better connection.",
        ),
      )
      return
    }
    if (okResults.length < selected.length) {
      toast(
        t(
          `${selected.length}枚中${okResults.length}枚を追加しました（読み込めなかった画像は、もう一度選んでください）`,
          `Added ${okResults.length} of ${selected.length} images (please select the rest again)`,
        ),
      )
    }

    // 生成情報は最後に選んだ画像から入れる
    const last = okResults[okResults.length - 1]
    const lastUrl = getSourceUrl(last)
    props.onSubmit(
      images,
      okResults.map((r) => r.id),
      // 生成元画像の URL は CORS で読めないことがあるので、生成情報の取り出し用にプロキシの URL を渡す
      lastUrl ? getDownloadProxyUrl(lastUrl) : "",
      last,
      okResults.map((r) => r.nanoid ?? ""),
    )
    setSelectedIds([])
    props.setIsOpen(false)
  }

  const previewIndex = results.findIndex((r) => r.id === previewId)
  const preview = previewIndex >= 0 ? results[previewIndex] : null

  // 大きく表示している間: ← → で前後、Space / Enter で選ぶ
  useEffect(() => {
    if (preview === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && previewIndex > 0) {
        setPreviewId(results[previewIndex - 1].id)
      } else if (e.key === "ArrowRight" && previewIndex < results.length - 1) {
        setPreviewId(results[previewIndex + 1].id)
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        toggleSelect(preview)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  })

  const thumbnailSize = THUMBNAIL_SIZES[sizeIndex]
  const isInitialLoading = loading && results.length === 0

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (open) return
        // 大きく表示しているときの Esc は一覧に戻るだけ
        if (preview !== null) {
          setPreviewId(null)
          return
        }
        close()
      }}
    >
      <DialogContent className="top-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:top-[50%] sm:h-[90dvh] sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-5xl sm:translate-y-[-50%] sm:rounded-xl">
        {/* 上: 見出しと表示の切り替え */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3 pr-14">
          <div className="min-w-0">
            <DialogTitle className="font-bold text-base">
              {t("生成履歴から選ぶ", "Choose from generated images")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {t(
                "タップで選択（選んだ順に並びます）。虫めがねで大きく表示",
                "Tap to select (added in order). Use the magnifier to enlarge",
              )}
            </DialogDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => changeSize(sizeIndex - 1)}
              disabled={sizeIndex === 0}
              aria-label={t("小さく表示", "Smaller")}
            >
              <ZoomOutIcon className="size-5" />
            </Button>
            <Slider
              className="w-20 sm:w-28"
              min={0}
              max={THUMBNAIL_SIZES.length - 1}
              step={1}
              value={[sizeIndex]}
              onValueChange={(value) => changeSize(value[0])}
              aria-label={t("表示の大きさ", "Thumbnail size")}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => changeSize(sizeIndex + 1)}
              disabled={sizeIndex === THUMBNAIL_SIZES.length - 1}
              aria-label={t("大きく表示", "Larger")}
            >
              <ZoomInIcon className="size-5" />
            </Button>
            <Button
              variant={isContain ? "secondary" : "outline"}
              size="sm"
              className="ml-1 h-9 px-2.5 text-xs"
              onClick={toggleFit}
              aria-pressed={isContain}
              title={t("切り抜かずに全体を表示", "Show whole image")}
            >
              {t("全体表示", "Whole")}
            </Button>
          </div>
        </div>

        {/* 中: 一覧 */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
          {isInitialLoading && (
            <div className="flex h-40 items-center justify-center">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isInitialLoading && error !== undefined && results.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-sm">
              <p>
                {t(
                  "生成履歴を読み込めませんでした",
                  "Failed to load your generated images",
                )}
              </p>
              <Button variant="secondary" onClick={() => void refetch()}>
                {t("もう一度読み込む", "Retry")}
              </Button>
            </div>
          )}
          {data !== undefined && !loading && results.length === 0 && (
            <p className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              {t("生成した画像がまだありません", "No generated images yet")}
            </p>
          )}
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`,
            }}
          >
            {results.map((result) => {
              const order = selectedIds.indexOf(result.id)
              const isSelected = order !== -1
              const isAlreadyAdded = isAdded(result)
              const thumbnail = result.thumbnailUrl || result.imageUrl
              return (
                <div
                  key={result.id}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-lg bg-muted",
                    isSelected && "ring-4 ring-blue-500 ring-inset",
                  )}
                >
                  <button
                    type="button"
                    className="absolute inset-0 size-full"
                    onClick={() => toggleSelect(result)}
                    disabled={isAlreadyAdded}
                    aria-pressed={isSelected}
                    aria-label={
                      isAlreadyAdded
                        ? t("追加済みの画像", "Already added")
                        : t("この画像を選ぶ", "Select this image")
                    }
                  >
                    {thumbnail && (
                      <img
                        className={cn(
                          "size-full transition-transform",
                          isContain ? "object-contain" : "object-cover",
                          isSelected && "scale-[0.92] rounded-md",
                          isAlreadyAdded && "opacity-40",
                        )}
                        src={thumbnail}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    )}
                  </button>
                  {/* 選んだ順番（追加済みの画像は「追加済み」） */}
                  {isAlreadyAdded ? (
                    <span className="pointer-events-none absolute top-1.5 left-1.5 flex h-6 items-center gap-0.5 rounded-full bg-black/70 px-2 font-bold text-[11px] text-white shadow">
                      <CheckIcon className="size-3" />
                      {t("追加済み", "Added")}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "pointer-events-none absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full border-2 font-bold text-xs shadow",
                        isSelected
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-white/80 bg-black/20",
                      )}
                    >
                      {isSelected ? order + 1 : null}
                    </span>
                  )}
                  {/* 大きく表示 */}
                  <button
                    type="button"
                    className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full bg-black/55 text-white opacity-90 transition hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    onClick={() => setPreviewId(result.id)}
                    aria-label={t("拡大して見る", "View larger")}
                  >
                    <SearchIcon className="size-4" />
                  </button>
                </div>
              )
            })}
          </div>
          {results.length > 0 && hasMore && (
            <div className="flex justify-center py-4">
              <Button
                variant="secondary"
                onClick={() => void loadMore()}
                disabled={isLoadingMore}
              >
                {isLoadingMore && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                {t("もっと見る", "Load more")}
              </Button>
            </div>
          )}
        </div>

        {/* 下: 選んだ枚数と追加 */}
        <div className="flex items-center gap-2 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0 text-sm">
            {selectedIds.length > 0 ? (
              <span className="font-bold">
                {t(
                  `${selectedIds.length}枚を選択中`,
                  `${selectedIds.length} selected`,
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t("画像を選んでください", "Select images")}
              </span>
            )}
          </div>
          {selectedIds.length > 0 && !isSubmitting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              {t("解除", "Clear")}
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={close} disabled={isSubmitting}>
              {t("キャンセル", "Cancel")}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || selectedIds.length === 0}
              className="min-w-24"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {`${progress?.done ?? 0}/${progress?.total ?? 0}`}
                </>
              ) : selectedIds.length > 0 ? (
                t(`${selectedIds.length}枚を追加`, `Add ${selectedIds.length}`)
              ) : (
                t("追加", "Add")
              )}
            </Button>
          </div>
        </div>

        {/* 大きく表示 */}
        {preview !== null && (
          <div className="absolute inset-0 z-10 flex flex-col bg-black/95 text-white">
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setPreviewId(null)}
                aria-label={t("一覧に戻る", "Back to list")}
              >
                <XIcon className="size-6" />
              </Button>
              <span className="text-sm text-white/70">
                {`${previewIndex + 1} / ${results.length}`}
              </span>
            </div>
            <div className="relative min-h-0 flex-1">
              <img
                key={preview.id}
                className="absolute inset-0 size-full object-contain"
                src={preview.imageUrl || preview.thumbnailUrl || ""}
                alt=""
              />
              {previewIndex > 0 && (
                <button
                  type="button"
                  className="-translate-y-1/2 absolute top-1/2 left-2 flex size-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
                  onClick={() => setPreviewId(results[previewIndex - 1].id)}
                  aria-label={t("前の画像", "Previous")}
                >
                  <ChevronLeftIcon className="size-7" />
                </button>
              )}
              {previewIndex < results.length - 1 && (
                <button
                  type="button"
                  className="-translate-y-1/2 absolute top-1/2 right-2 flex size-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
                  onClick={() => setPreviewId(results[previewIndex + 1].id)}
                  aria-label={t("次の画像", "Next")}
                >
                  <ChevronRightIcon className="size-7" />
                </button>
              )}
            </div>
            <div className="flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button
                size="lg"
                className={cn(
                  "min-w-48 rounded-full font-bold",
                  selectedIds.includes(preview.id) &&
                    "bg-blue-500 text-white hover:bg-blue-600",
                )}
                variant={
                  selectedIds.includes(preview.id) ? "default" : "secondary"
                }
                onClick={() => toggleSelect(preview)}
                disabled={isSubmitting || isAdded(preview)}
              >
                {isAdded(preview) ? (
                  <>
                    <CheckIcon className="mr-2 size-5" />
                    {t("追加済み", "Already added")}
                  </>
                ) : selectedIds.includes(preview.id) ? (
                  <>
                    <CheckIcon className="mr-2 size-5" />
                    {t(
                      `選択中（${selectedIds.indexOf(preview.id) + 1}枚目）`,
                      `Selected (#${selectedIds.indexOf(preview.id) + 1})`,
                    )}
                  </>
                ) : (
                  t("この画像を選ぶ", "Select this image")
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

const viewerImageGenerationResultsQuery = graphql(
  `query ViewerImageGenerationResultsForPost($offset: Int!, $limit: Int!, $where: ImageGenerationResultsWhereInput) {
    viewer {
      id
      imageGenerationResults(offset: $offset, limit: $limit, where: $where) {
        id
        imageUrl
        thumbnailUrl
        nanoid
        prompt
        negativePrompt
        seed
        steps
        scale
        sampler
        vae
        modelHash
        model {
          id
          name
        }
      }
    }
  }`,
)
