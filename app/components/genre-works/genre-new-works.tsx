import { useApolloClient } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { useNavigate } from "~/lib/app/locale-router"
import type { FragmentOf } from "gql.tada"
import { Loader2Icon, SlidersHorizontalIcon, SparklesIcon } from "lucide-react"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { GenreConfig } from "~/components/genre-works/genre-works-config"
import type { GenreWorksData } from "~/components/genre-works/genre-works-loader.server"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { WorksQuery } from "~/routes/($lang)._main._index/components/works-pagination-mode"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import type {
  WorkOrderBy,
  WorkType,
} from "~/routes/($lang)._main._index/types/works"

type Props = {
  genre: GenreConfig
  works: GenreWorksData["newWorks"]
  userLinkPrefix?: string
}

const WORK_TYPES: readonly WorkType[] = ["WORK", "VIDEO", "NOVEL", "COLUMN"]

const SORT_TYPES: readonly WorkOrderBy[] = [
  "DATE_CREATED",
  "LIKES_COUNT",
  "COMMENTS_COUNT",
]

const TIME_RANGES = ["ALL", "TODAY", "YESTERDAY", "WEEK"] as const

/** 「もっと見る」で 1 回に読む数（サーバーで描く数と同じ） */
const PER_PAGE = 24

const parsePage = (value: string | null) => {
  const page = Number.parseInt(value ?? "", 10)
  return Number.isFinite(page) && page >= 0 ? page : 0
}

/**
 * ジャンルの新着一覧
 * - 絞り込みをしていないときの 1 ページ目はサーバーで描く（検索エンジンと、hydration 前の表示のため）
 * - 絞り込み・ページ切り替えをしたら既存の一覧（HomeWorksSection）に任せる
 * - 下のよくある質問まで届くように、最初は「もっと見る」で止め、押したあとは続けて読む
 */
export function GenreNewWorks(props: Props) {
  const t = useTranslation()
  const navigate = useNavigate()
  const client = useApolloClient()
  const [searchParams] = useSearchParams()
  const topRef = useRef<HTMLDivElement>(null)

  const initialType = searchParams.get("workType") as WorkType | null
  const initialSort = searchParams.get("sortType") as WorkOrderBy | null
  const initialRange = searchParams.get("timeRange")

  const [workType, setWorkType] = useState<WorkType | null>(
    initialType && WORK_TYPES.includes(initialType) ? initialType : null,
  )
  const [sortType, setSortType] = useState<WorkOrderBy>(
    initialSort && SORT_TYPES.includes(initialSort)
      ? initialSort
      : "DATE_CREATED",
  )
  const [timeRange, setTimeRange] = useState<string>(
    initialRange && (TIME_RANGES as readonly string[]).includes(initialRange)
      ? initialRange
      : "ALL",
  )
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(
    searchParams.get("isPromptPublic") === "true" ? true : null,
  )
  const [isPagination, setIsPagination] = useState(
    searchParams.get("isPagination") === "true" ||
      parsePage(searchParams.get("page")) > 0,
  )

  const isFiltered =
    workType !== null ||
    sortType !== "DATE_CREATED" ||
    timeRange !== "ALL" ||
    isPromptPublic !== null

  /**
   * URL だけを書き換える（Remix の遷移にすると絞り込みのたびに親の loader まで読み直して反応が遅い）
   * ページ送りは既存の一覧が URL の page を読むので navigate を使う
   */
  const writeParams = (
    update: (params: URLSearchParams) => void,
    options: { isNavigate?: boolean } = {},
  ) => {
    const params = new URLSearchParams(window.location.search)
    const hadPage = params.has("page")
    update(params)
    const search = params.toString()
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`
    if (options.isNavigate || (hadPage && !params.has("page"))) {
      navigate(url, { replace: !options.isNavigate, preventScrollReset: true })
      return
    }
    window.history.replaceState(window.history.state, "", url)
  }

  const setOrDelete = (name: string, value: string | null) =>
    writeParams((params) => {
      params.delete("page")
      if (value === null) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
    })

  const onChangeWorkType = (value: string) => {
    const next = value === "ALL" ? null : (value as WorkType)
    setWorkType(next)
    setOrDelete("workType", next)
  }

  const onChangeSort = (value: WorkOrderBy) => {
    setSortType(value)
    setOrDelete("sortType", value === "DATE_CREATED" ? null : value)
  }

  const onChangeTimeRange = (value: string) => {
    setTimeRange(value)
    setOrDelete("timeRange", value === "ALL" ? null : value)
  }

  const onTogglePrompt = () => {
    const next = isPromptPublic ? null : true
    setIsPromptPublic(next)
    setOrDelete("isPromptPublic", next ? "true" : null)
  }

  const onChangePagination = (value: boolean) => {
    setIsPagination(value)
    writeParams((params) => {
      params.delete("page")
      if (value) {
        params.set("isPagination", "true")
      } else {
        params.delete("isPagination")
      }
    })
  }

  const onChangePage = (page: number) => {
    writeParams(
      (params) => {
        params.set("page", page.toString())
      },
      { isNavigate: true },
    )
  }

  // ページを移ったら一覧の先頭に戻す（最初の表示では動かさない）
  const currentPage = searchParams.get("page")
  const previousPageRef = useRef(currentPage)
  useEffect(() => {
    if (previousPageRef.current === currentPage) return
    previousPageRef.current = currentPage
    topRef.current?.scrollIntoView({ block: "start" })
  }, [currentPage])

  const onReset = () => {
    setWorkType(null)
    setSortType("DATE_CREATED")
    setTimeRange("ALL")
    setIsPromptPublic(null)
    writeParams((params) => {
      for (const name of [
        "page",
        "workType",
        "sortType",
        "timeRange",
        "isPromptPublic",
      ]) {
        params.delete(name)
      }
    })
  }

  // 「もっと見る」で読み足す分（サーバーで描いた分と同じ条件で続きを読む）
  const [moreWorks, setMoreWorks] = useState<GenreWorksData["newWorks"]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNext, setHasNext] = useState(props.works.length > 0)
  // 1 人 1 作品の条件は limit 件を取ったあとに減らされるので、offset は読んだ件数ではなく要求した件数で進める
  const [nextOffset, setNextOffset] = useState(PER_PAGE)

  // 一覧が読む項目だけを取っている（GenreNewWorkFragment）
  const allWorks = [...props.works, ...moreWorks] as unknown as FragmentOf<
    typeof PhotoAlbumWorkFragment
  >[]

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNext) return
    setIsLoadingMore(true)
    try {
      const result = await client.query({
        query: WorksQuery,
        fetchPolicy: "no-cache",
        variables: {
          offset: nextOffset,
          limit: PER_PAGE,
          where: {
            style: props.genre.style,
            ...(props.genre.isSensitive
              ? { ratings: ["R18"] as const }
              : { ratings: ["G"] as const, isSensitive: false }),
            isNowCreatedAt: true,
            orderBy: "DATE_CREATED",
            isOneWorkPerUser: true,
          },
        },
      })
      const next = result.data.works
      setHasNext(next.length > 0)
      setNextOffset((current) => current + PER_PAGE)
      setMoreWorks((current) => {
        const ids = new Set([...props.works, ...current].map((work) => work.id))
        return [...current, ...next.filter((work) => !ids.has(work.id))]
      })
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    client,
    hasNext,
    isLoadingMore,
    nextOffset,
    props.genre.isSensitive,
    props.genre.style,
    props.works,
  ])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext: isExpanded && hasNext,
    loading: isLoadingMore,
  })

  const isServerList = !isFiltered && !isPagination

  const sortLabels: Record<string, string> = {
    DATE_CREATED: t("新着順", "Latest"),
    LIKES_COUNT: t("人気順", "Most liked"),
    COMMENTS_COUNT: t("コメント順", "Most comments"),
  }

  return (
    <section
      aria-labelledby="genre-new-heading"
      className="scroll-mt-20 space-y-4"
    >
      <div ref={topRef} className="scroll-mt-20" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="genre-new-heading"
          className="flex items-center gap-1.5 font-bold text-lg md:text-xl"
        >
          <SparklesIcon className="size-5 text-primary" />
          {t(props.genre.newTitle[0], props.genre.newTitle[1])}
        </h2>
        <HomeViewModeToggles
          isPagination={isPagination}
          onPaginationChange={onChangePagination}
        />
      </div>

      {/* 絞り込み */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
        <SlidersHorizontalIcon
          aria-hidden={true}
          className="ml-1 hidden size-4 text-muted-foreground sm:block"
        />
        <fieldset className="inline-flex rounded-full border bg-muted/40 p-0.5">
          <legend className="sr-only">{t("並び順", "Sort")}</legend>
          {SORT_TYPES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={sortType === value}
              onClick={() => onChangeSort(value)}
              className={cn(
                "h-8 rounded-full px-3 font-medium text-xs transition-colors",
                sortType === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {sortLabels[value]}
            </button>
          ))}
        </fieldset>
        <Select value={workType ?? "ALL"} onValueChange={onChangeWorkType}>
          <SelectTrigger
            aria-label={t("種類", "Type")}
            className="h-9 w-auto min-w-24 rounded-full text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("すべての種類", "All types")}
            </SelectItem>
            <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
            <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
            <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
            <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={onChangeTimeRange}>
          <SelectTrigger
            aria-label={t("期間", "Period")}
            className="h-9 w-auto min-w-24 rounded-full text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("全期間", "All time")}</SelectItem>
            <SelectItem value="TODAY">{t("今日", "Today")}</SelectItem>
            <SelectItem value="YESTERDAY">{t("昨日", "Yesterday")}</SelectItem>
            <SelectItem value="WEEK">{t("先週", "Last week")}</SelectItem>
          </SelectContent>
        </Select>
        <button
          type="button"
          aria-pressed={isPromptPublic === true}
          onClick={onTogglePrompt}
          className={cn(
            "h-9 rounded-full border px-3 font-medium text-xs transition-colors",
            isPromptPublic
              ? "border-foreground bg-foreground text-background"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {t("プロンプト公開", "Prompt shared")}
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="h-9 rounded-full px-2 text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            {t("条件をクリア", "Clear")}
          </button>
        )}
      </div>

      {isServerList ? (
        <div className="space-y-6">
          <ResponsivePhotoWorksAlbum
            works={allWorks}
            isShowProfile={true}
            userLinkPrefix={props.userLinkPrefix}
          />
          {isExpanded && hasNext && <div ref={sentinelRef} className="h-px" />}
          {isLoadingMore && (
            <div className="flex justify-center py-6">
              <Loader2Icon className="size-7 animate-spin text-border" />
            </div>
          )}
          {!isExpanded && hasNext && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                className="min-w-48 rounded-full"
                onClick={() => {
                  setIsExpanded(true)
                  void loadMore()
                }}
              >
                {t("もっと見る", "Show more")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[60vh]">
          <Suspense fallback={<AppLoadingPage />}>
            {props.genre.isSensitive ? (
              <HomeSensitiveWorksSection
                page={parsePage(currentPage)}
                setPage={onChangePage}
                style={props.genre.style}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
                timeRange={timeRange}
                isPagination={isPagination}
              />
            ) : (
              <HomeWorksSection
                style={props.genre.style}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
                timeRange={timeRange}
                isPagination={isPagination}
                onPageChange={onChangePage}
              />
            )}
          </Suspense>
        </div>
      )}
    </section>
  )
}
