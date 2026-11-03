import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { addDays, format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getStatusLabel,
  ThemeProposalCard,
  type ThemeProposalCardItem,
} from "~/routes/($lang)._main.themes.proposals._index/components/theme-proposal-card"

type ThemeProposal = ThemeProposalCardItem

type QueryData = {
  themeProposals: ThemeProposal[]
  themeProposalsCount: number
}

type StatusCountsData = {
  pendingCount: number
  adoptedCount: number
}

type ThemeProposalsQueryVariables = {
  offset: number
  limit: number
  status?: string
  orderBy?: string
  proposerUserId?: string
  date?: string
  year?: number
  month?: number
  startDate?: string
  endDate?: string
}

type ProposalPeriod = "all" | "day" | "week" | "month"

type ProposalSort = "date" | "likes"

type ProposalStatusFilter = "all" | "PENDING" | "ADOPTED" | "REJECTED"

type ThemeProposalsPageContentProps = {
  scope?: "all" | "mine"
}

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"
const PAGE_SIZE = 24

export const meta: MetaFunction = (props) => {
  return createMeta(META.THEME_PROPOSALS, undefined, props.params.lang)
}

export default function ThemeProposalsPage() {
  return <ThemeProposalsPageContent scope="all" />
}

export function ThemeProposalsPageContent(
  props: ThemeProposalsPageContentProps,
) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [cancelProposal, { loading: isCanceling }] = useMutation(
    CancelThemeProposalMutation,
  )
  const [createThemeProposalLike] = useMutation(CreateThemeProposalLikeMutation)
  const [deleteThemeProposalLike] = useMutation(DeleteThemeProposalLikeMutation)
  const [pendingLikeIds, setPendingLikeIds] = useState<string[]>([])
  const isMinePage = props.scope === "mine"
  const proposerUserId = isMinePage
    ? (authContext.userId ?? undefined)
    : undefined
  const shouldSkipMineQuery =
    isMinePage &&
    (authContext.isLoading ||
      authContext.isNotLoggedIn ||
      authContext.userId === null)

  const period = getPeriod(searchParams.get("period"))
  const sort = getSort(searchParams.get("sort"))
  const status = getStatusFilter(searchParams.get("status"))
  const currentPage = getPage(searchParams.get("page"))
  const dayValue = getDayValue(searchParams.get("day"))
  const weekValue = getWeekValue(searchParams.get("week"))
  const monthValue = getMonthValue(searchParams.get("month"))
  const filterVariables = getFilterVariables({
    period,
    dayValue,
    weekValue,
    monthValue,
  })

  const { data, loading, refetch } = useQuery<
    QueryData,
    ThemeProposalsQueryVariables
  >(ThemeProposalsQuery, {
    variables: {
      offset: PAGE_SIZE * currentPage,
      limit: PAGE_SIZE,
      ...(status !== "all" ? { status } : {}),
      ...(sort === "likes" ? { orderBy: "LIKES_COUNT" } : {}),
      proposerUserId,
      ...filterVariables,
    },
    skip: shouldSkipMineQuery,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  const statusCounts = useQuery<StatusCountsData>(ThemeProposalStatusCountsQuery, {
    variables: { proposerUserId },
    skip: shouldSkipMineQuery,
    fetchPolicy: "cache-and-network",
  })

  const myProposalPreview = useQuery<QueryData, ThemeProposalsQueryVariables>(
    ThemeProposalsQuery,
    {
      variables: {
        offset: 0,
        limit: 3,
        proposerUserId: authContext.userId ?? undefined,
      },
      skip:
        isMinePage ||
        authContext.isLoading ||
        authContext.isNotLoggedIn ||
        authContext.userId === null,
      fetchPolicy: "cache-and-network",
    },
  )

  const proposals = data?.themeProposals ?? []
  const totalCount = data?.themeProposalsCount ?? 0
  const pendingCount = statusCounts.data?.pendingCount ?? null
  const adoptedCount = statusCounts.data?.adoptedCount ?? null
  const myPreviewItems = myProposalPreview.data?.themeProposals ?? []
  const myPreviewCount = myProposalPreview.data?.themeProposalsCount ?? 0
  const hasFilter = period !== "all" || sort !== "date" || status !== "all"

  const updateSearch = (
    update: (params: URLSearchParams) => void,
    options?: { resetPage?: boolean },
  ) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        update(next)

        if (options?.resetPage ?? true) {
          next.delete("page")
        }

        return next
      },
      { preventScrollReset: true },
    )
  }

  const onPeriodChange = (value: ProposalPeriod) => {
    updateSearch((params) => {
      if (value === "all") {
        params.delete("period")
        params.delete("day")
        params.delete("week")
        params.delete("month")
        return
      }

      params.set("period", value)

      if (value === "day") {
        params.set("day", dayValue ?? getCurrentDateValue())
        params.delete("week")
        params.delete("month")
        return
      }

      if (value === "week") {
        params.set("week", weekValue ?? getCurrentWeekValue())
        params.delete("day")
        params.delete("month")
        return
      }

      params.set("month", monthValue ?? getCurrentMonthValue())
      params.delete("day")
      params.delete("week")
    })
  }

  const onCancel = async (proposalId: string) => {
    try {
      await cancelProposal({ variables: { proposalId } })
      toast(t("提案を取り消しました", "Withdrew the proposal"))
      void refetch()
      void statusCounts.refetch()
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t("取り消せませんでした", "Could not withdraw"),
      )
    }
  }

  // いいねは押した瞬間に表示を変え、失敗したら元に戻す
  const onToggleLike = async (proposal: ThemeProposal) => {
    if (pendingLikeIds.includes(proposal.id)) {
      return
    }

    setPendingLikeIds((ids) => [...ids, proposal.id])

    const optimisticResponse = {
      __typename: "ThemeProposalNode",
      id: proposal.id,
      isLiked: !proposal.isLiked,
      likesCount: Math.max(0, proposal.likesCount + (proposal.isLiked ? -1 : 1)),
    }

    try {
      if (proposal.isLiked) {
        await deleteThemeProposalLike({
          variables: { proposalId: proposal.id },
          optimisticResponse: { deleteThemeProposalLike: optimisticResponse },
        })
      } else {
        await createThemeProposalLike({
          variables: { proposalId: proposal.id },
          optimisticResponse: { createThemeProposalLike: optimisticResponse },
        })
      }
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t("いいねできませんでした", "Could not like"),
      )
    } finally {
      setPendingLikeIds((ids) => ids.filter((id) => id !== proposal.id))
    }
  }

  const statusTabs: Array<{
    value: ProposalStatusFilter
    label: string
    count: number | null
  }> = [
    { value: "all", label: t("すべて", "All"), count: null },
    { value: "PENDING", label: t("受付中", "Open"), count: pendingCount },
    { value: "ADOPTED", label: t("採用", "Adopted"), count: adoptedCount },
    { value: "REJECTED", label: t("見送り", "Not selected"), count: null },
  ]

  return (
    <div className="space-y-5 pb-24">
      {isMinePage ? (
        <div className="space-y-3">
          <Link
            to="/themes/proposals"
            className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            {t("みんなの提案", "All proposals")}
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-bold text-2xl">
                {t("あなたの提案", "Your proposals")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t(
                  "送ったお題の結果をここで確認できます。",
                  "Check how your proposals are doing.",
                )}
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/themes/proposals/new">
                <PlusIcon className="mr-1 size-4" />
                {t("お題を提案する", "Propose a theme")}
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <section className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-amber-400 via-orange-400 to-rose-500 p-5 text-white shadow-sm md:p-7">
          <div
            aria-hidden="true"
            className="-right-10 -bottom-16 -z-10 absolute size-64 rounded-full bg-white/20 blur-3xl"
          />
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="hidden size-16 shrink-0 border-4 border-white/70 bg-white shadow-lg sm:block">
                <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="" />
                <AvatarFallback>ぴ</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5">
                <h1 className="font-black text-2xl md:text-3xl">
                  {t("お題の提案", "Theme proposals")}
                </h1>
                <p className="max-w-xl text-sm text-white/95 leading-relaxed">
                  {t(
                    "8日後以降のお題を誰でも提案できます。ぴくたーちゃんが毎日選んで、いいねが多い案ほど採用されやすくなります。採用されるとお題ページにあなたの名前が載ります。",
                    "Anyone can propose themes from 8 days ahead. Pictor-chan picks daily, and more likes help. Adopted themes show your name on the theme page.",
                  )}
                </p>
                {/* 件数が届く前から場所を取っておく（下の一覧がずれないように） */}
                <div className="flex min-h-7 flex-wrap gap-2 pt-1 text-xs">
                  {pendingCount !== null && (
                    <span className="rounded-full bg-white/25 px-2.5 py-1 backdrop-blur">
                      {t(
                        `受付中 ${pendingCount}件`,
                        `${pendingCount} open`,
                      )}
                    </span>
                  )}
                  {adoptedCount !== null && (
                    <span className="rounded-full bg-white/25 px-2.5 py-1 backdrop-blur">
                      {t(
                        `これまでに ${adoptedCount}件が採用`,
                        `${adoptedCount} adopted so far`,
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-6 font-bold text-orange-600 shadow-lg hover:bg-white/90"
              >
                <Link to="/themes/proposals/new">
                  <PlusIcon className="mr-1 size-5" />
                  {t("お題を提案する", "Propose a theme")}
                </Link>
              </Button>
              {authContext.isLoggedIn && (
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full border border-white/60 bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link to="/themes/proposals/mine">
                    {t("あなたの提案", "Your proposals")}
                    {myPreviewCount > 0 && (
                      <span className="ml-1.5 rounded-full bg-white/25 px-2 text-xs">
                        {myPreviewCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {!isMinePage && myPreviewItems.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 font-medium text-muted-foreground text-xs">
            {t("あなたの最近の提案", "Your recent")}
          </span>
          {myPreviewItems.map((proposal) => (
            <Link
              key={proposal.id}
              to="/themes/proposals/mine"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm transition hover:border-foreground/30"
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  proposal.status === "ADOPTED"
                    ? "bg-emerald-500"
                    : proposal.status === "PENDING"
                      ? "bg-amber-400"
                      : "bg-zinc-400",
                )}
              />
              <span className="max-w-40 truncate">「{proposal.inputTheme}」</span>
              <span className="text-muted-foreground text-xs">
                {getStatusLabel(t, proposal.status)}
              </span>
            </Link>
          ))}
          <Link
            to="/themes/proposals/mine"
            className="inline-flex shrink-0 items-center text-muted-foreground text-xs hover:text-foreground"
          >
            {t("すべて", "All")}
            <ChevronRightIcon className="size-3.5" />
          </Link>
        </div>
      )}

      <div className="-mx-1 sticky top-14 z-10 flex flex-col gap-2 rounded-2xl border bg-background/90 p-2 shadow-xs backdrop-blur md:top-16 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => {
                updateSearch((params) => {
                  if (tab.value === "all") {
                    params.delete("status")
                  } else {
                    params.set("status", tab.value)
                  }
                })
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium text-sm transition",
                status === tab.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    status === tab.value ? "bg-background/20" : "bg-muted",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-muted p-0.5 text-sm">
            {(["date", "likes"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={sort === value}
                onClick={() => {
                  updateSearch((params) => {
                    if (value === "date") {
                      params.delete("sort")
                    } else {
                      params.set("sort", value)
                    }
                  })
                }}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  sort === value
                    ? "bg-background font-semibold shadow-xs"
                    : "text-muted-foreground",
                )}
              >
                {value === "date" ? t("新着", "Newest") : t("いいね順", "Most liked")}
              </button>
            ))}
          </div>
          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as ProposalPeriod)}
          >
            <SelectTrigger
              className="h-8 w-28 rounded-full text-sm"
              aria-label={t("期間", "Period")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("全期間", "All time")}</SelectItem>
              <SelectItem value="day">{t("日付で", "By day")}</SelectItem>
              <SelectItem value="week">{t("週で", "By week")}</SelectItem>
              <SelectItem value="month">{t("月で", "By month")}</SelectItem>
            </SelectContent>
          </Select>
          {period !== "all" && (
            <Input
              type={period === "day" ? "date" : period}
              aria-label={t("対象日", "Target date")}
              value={
                (period === "day"
                  ? dayValue
                  : period === "week"
                    ? weekValue
                    : monthValue) ?? ""
              }
              onChange={(event) => {
                updateSearch((params) => {
                  if (event.target.value.length > 0) {
                    params.set(period, event.target.value)
                  } else {
                    params.delete(period)
                  }
                })
              }}
              className="h-8 w-40 rounded-full text-sm"
            />
          )}
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full px-2 text-muted-foreground"
              onClick={() => {
                updateSearch((params) => {
                  params.delete("period")
                  params.delete("day")
                  params.delete("week")
                  params.delete("month")
                  params.delete("sort")
                  params.delete("status")
                })
              }}
            >
              <XIcon className="mr-1 size-3.5" />
              {t("解除", "Clear")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          {getFilterSummary(t, period, dayValue, weekValue, monthValue)}
          {" ・ "}
          {t(`${totalCount}件`, `${totalCount} items`)}
        </span>
        {loading && proposals.length > 0 && (
          <Loader2Icon className="size-4 animate-spin" />
        )}
      </div>

      {isMinePage && authContext.isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2Icon className="mr-2 animate-spin" />
          {t("読み込み中", "Loading")}
        </div>
      ) : isMinePage && authContext.isNotLoggedIn ? (
        <EmptyState
          title={t(
            "あなたの提案を見るにはログインが必要です",
            "Sign in to see your proposals",
          )}
        />
      ) : loading && proposals.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: 読み込み中の枠
              key={index}
              className="h-52 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          title={
            isMinePage
              ? t("まだ提案していません", "No proposals yet")
              : t("条件に合う提案はありません", "No proposals match")
          }
          description={
            isMinePage
              ? t(
                  "思いついたお題を気軽に送ってみましょう。",
                  "Send any theme idea you have.",
                )
              : t(
                  "絞り込みを変えるか、最初の提案をしてみましょう。",
                  "Change the filter, or be the first to propose.",
                )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {proposals.map((proposal) => (
            <ThemeProposalCard
              key={proposal.id}
              proposal={proposal}
              viewerUserId={authContext.userId ?? null}
              isLoggedIn={authContext.isLoggedIn}
              isCanceling={isCanceling}
              onToggleLike={(item) => {
                void onToggleLike(item)
              }}
              onCancel={onCancel}
              onUpdated={() => {
                void refetch()
              }}
            />
          ))}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <ResponsivePagination
          perPage={PAGE_SIZE}
          maxCount={totalCount}
          currentPage={currentPage}
          onPageChange={(page) => {
            updateSearch(
              (params) => {
                params.set("page", String(page))
              },
              { resetPage: false },
            )
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
      )}
    </div>
  )
}

function EmptyState(props: { title: string; description?: string }) {
  const t = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
      <Avatar className="size-14">
        <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="" />
        <AvatarFallback>ぴ</AvatarFallback>
      </Avatar>
      <p className="font-semibold">{props.title}</p>
      {props.description && (
        <p className="text-muted-foreground text-sm">{props.description}</p>
      )}
      <Button asChild className="rounded-full">
        <Link to="/themes/proposals/new">
          <PlusIcon className="mr-1 size-4" />
          {t("お題を提案する", "Propose a theme")}
        </Link>
      </Button>
    </div>
  )
}

function getStatusFilter(value: string | null): ProposalStatusFilter {
  switch (value) {
    case "PENDING":
    case "ADOPTED":
    case "REJECTED":
      return value
    default:
      return "all"
  }
}

function getPeriod(value: string | null): ProposalPeriod {
  switch (value) {
    case "day":
    case "week":
    case "month":
      return value
    default:
      return "all"
  }
}

function getSort(value: string | null): ProposalSort {
  switch (value) {
    case "likes":
      return "likes"
    default:
      return "date"
  }
}

function getPage(value: string | null) {
  const page = Number.parseInt(value ?? "0", 10)

  if (Number.isNaN(page) || page < 0) {
    return 0
  }

  return page
}

function getDayValue(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function getWeekValue(value: string | null) {
  return value && /^\d{4}-W\d{2}$/.test(value) ? value : null
}

function getMonthValue(value: string | null) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : null
}

function getCurrentDateValue() {
  return format(new Date(), "yyyy-MM-dd")
}

function getCurrentMonthValue() {
  return format(new Date(), "yyyy-MM")
}

function getCurrentWeekValue() {
  return toIsoWeekValue(new Date())
}

function toIsoWeekValue(date: Date) {
  const workingDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNumber = workingDate.getUTCDay() || 7
  workingDate.setUTCDate(workingDate.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(
    ((workingDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  )

  return `${workingDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`
}

function getWeekRange(weekValue: string) {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekValue)

  if (match === null) {
    return null
  }

  const year = Number.parseInt(match[1], 10)
  const week = Number.parseInt(match[2], 10)

  if (Number.isNaN(year) || Number.isNaN(week) || week < 1 || week > 53) {
    return null
  }

  const firstWeekAnchor = new Date(Date.UTC(year, 0, 4))
  const firstWeekDay = firstWeekAnchor.getUTCDay() || 7
  const start = new Date(firstWeekAnchor)
  start.setUTCDate(
    firstWeekAnchor.getUTCDate() - firstWeekDay + 1 + (week - 1) * 7,
  )

  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(addDays(start, 6), "yyyy-MM-dd"),
  }
}

function getMonthFilter(monthValue: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthValue)

  if (match === null) {
    return null
  }

  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return null
  }

  return { year, month }
}

function getFilterVariables(params: {
  period: ProposalPeriod
  dayValue: string | null
  weekValue: string | null
  monthValue: string | null
}) {
  if (params.period === "day" && params.dayValue) {
    return { date: params.dayValue }
  }

  if (params.period === "week" && params.weekValue) {
    const range = getWeekRange(params.weekValue)

    if (range) {
      return range
    }
  }

  if (params.period === "month" && params.monthValue) {
    const monthFilter = getMonthFilter(params.monthValue)

    if (monthFilter) {
      return monthFilter
    }
  }

  return {}
}

function getFilterSummary(
  t: ReturnType<typeof useTranslation>,
  period: ProposalPeriod,
  dayValue: string | null,
  weekValue: string | null,
  monthValue: string | null,
) {
  if (period === "day" && dayValue) {
    return format(new Date(`${dayValue}T00:00:00`), "yyyy/MM/dd (EEE)", {
      locale: ja,
    })
  }

  if (period === "week" && weekValue) {
    const range = getWeekRange(weekValue)

    if (range) {
      return `${range.startDate.replaceAll("-", "/")} - ${range.endDate.replaceAll("-", "/")}`
    }
  }

  if (period === "month" && monthValue) {
    return monthValue.replace("-", "/")
  }

  return t("全期間", "All periods")
}

const ThemeProposalsQuery = gql`
  query ThemeProposals(
    $offset: Int!
    $limit: Int!
    $status: String
    $orderBy: String
    $proposerUserId: ID
    $date: String
    $year: Int
    $month: Int
    $startDate: String
    $endDate: String
  ) {
    themeProposals(
      offset: $offset
      limit: $limit
      status: $status
      orderBy: $orderBy
      proposerUserId: $proposerUserId
      date: $date
      year: $year
      month: $month
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      title
      enTitle
      promptName
      inputTheme
      targetDate
      status
      proposerUserId
      proposerName
      proposerIconUrl
      allowOtherDate
      note
      decisionComment
      createdAt
      updatedAt
      decidedAt
      adoptedSubjectId
      canCancel
      likesCount
      isLiked
    }
    themeProposalsCount(
      status: $status
      proposerUserId: $proposerUserId
      date: $date
      year: $year
      month: $month
      startDate: $startDate
      endDate: $endDate
    )
  }
`

const CancelThemeProposalMutation = gql`
  mutation CancelThemeProposal($proposalId: ID!) {
    cancelThemeProposal(proposalId: $proposalId) {
      id
      status
    }
  }
`

const CreateThemeProposalLikeMutation = gql`
  mutation CreateThemeProposalLike($proposalId: ID!) {
    createThemeProposalLike(proposalId: $proposalId) {
      id
      likesCount
      isLiked
    }
  }
`

const DeleteThemeProposalLikeMutation = gql`
  mutation DeleteThemeProposalLike($proposalId: ID!) {
    deleteThemeProposalLike(proposalId: $proposalId) {
      id
      likesCount
      isLiked
    }
  }
`

const ThemeProposalStatusCountsQuery = gql`
  query ThemeProposalStatusCounts($proposerUserId: ID) {
    pendingCount: themeProposalsCount(status: "PENDING", proposerUserId: $proposerUserId)
    adoptedCount: themeProposalsCount(status: "ADOPTED", proposerUserId: $proposerUserId)
  }
`
