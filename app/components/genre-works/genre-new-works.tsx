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

  const workTypeLabels: Record<WorkType | "ALL", string> = {
    ALL: t("すべての種類", "All types"),
    WORK: t("画像", "Image"),
    VIDEO: t("動画", "Video"),
    NOVEL: t("小説", "Novel"),
    COLUMN: t("コラム", "Column"),
  }

  // 全年齢の一覧は「先週（月〜日）」、R18 の一覧は「過去 7 日」で絞る（works-utils / home-sensitive-works-section）
  const timeRangeLabels: Record<(typeof TIME_RANGES)[number], string> = {
    ALL: t("全期間", "All time"),
    TODAY: t("今日", "Today"),
    YESTERDAY: t("昨日", "Yesterday"),
    WEEK: props.genre.isSensitive
      ? t("7日間", "7 days")
      : t("先週", "Last week"),
  }

  return (
    <section
      id="genre-new"
      aria-labelledby="genre-new-heading"
      className="scroll-mt-20 space-y-4 md:scroll-mt-24"
    >
      <div ref={topRef} className="scroll-mt-20 md:scroll-mt-24" />
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

      {/* 絞り込み（スマホは 1 行で横に滑らせる。縦に伸びて一覧が画面の下へ押し出されないように） */}
      <div className="-mx-3 flex items-center gap-2 overflow-x-auto overscroll-x-contain border-y bg-card px-3 py-2 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:rounded-xl md:border md:px-2 md:[mask-image:none] [&::-webkit-scrollbar]:hidden">
        <SlidersHorizontalIcon
          aria-hidden={true}
          className="ml-1 hidden size-4 shrink-0 text-muted-foreground md:block"
        />
        <SegmentedButtons
          legend={t("並び順", "Sort")}
          options={SORT_TYPES.map((value) => ({
            value,
            label: sortLabels[value],
          }))}
          value={sortType}
          onChange={onChangeSort}
        />
        <SegmentedButtons
          legend={t("期間", "Period")}
          options={TIME_RANGES.map((value) => ({
            value,
            label: timeRangeLabels[value],
          }))}
          value={timeRange}
          onChange={onChangeTimeRange}
        />
        <Select value={workType ?? "ALL"} onValueChange={onChangeWorkType}>
          <SelectTrigger
            aria-label={t("種類", "Type")}
            className="h-9 w-auto min-w-24 shrink-0 rounded-full text-xs"
          >
            {/* hydration の前から選んでいる種類を出す（中身を渡さないと開くまで空になる） */}
            <SelectValue>{workTypeLabels[workType ?? "ALL"]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(["ALL", ...WORK_TYPES] as const).map((value) => (
              <SelectItem key={value} value={value}>
                {workTypeLabels[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          aria-pressed={isPromptPublic === true}
          onClick={onTogglePrompt}
          className={cn(
            "h-9 shrink-0 whitespace-nowrap rounded-full border px-3 font-medium text-xs transition-colors",
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
            className="h-9 shrink-0 whitespace-nowrap rounded-full px-2 text-muted-foreground text-xs underline-offset-2 hover:underline"
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

/** 並び順・期間の切り替え（押したものが白く浮く） */
function SegmentedButtons<T extends string>(props: {
  legend: string
  options: readonly { value: T; label: string }[]
  value: string
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="inline-flex shrink-0 rounded-full border bg-muted/40 p-0.5">
      <legend className="sr-only">{props.legend}</legend>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={props.value === option.value}
          onClick={() => props.onChange(option.value)}
          className={cn(
            "h-8 whitespace-nowrap rounded-full px-3 font-medium text-xs transition-colors",
            props.value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  )
}
