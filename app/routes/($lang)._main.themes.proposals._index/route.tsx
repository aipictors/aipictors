import { gql, useMutation, useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { addDays, format } from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronDown, ChevronUp, Heart, Loader2Icon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type ThemeProposal = {
  id: string
  title: string
  enTitle: string
  promptName: string
  inputTheme: string
  targetDate: string
  status: string
  proposerUserId: string
  proposerName: string
  proposerIconUrl: string
  decisionComment?: string | null
  createdAt: number
  updatedAt: number
  decidedAt?: number | null
  adoptedSubjectId?: string | null
  canCancel: boolean
  likesCount: number
  isLiked: boolean
}

type QueryData = {
  themeProposals: ThemeProposal[]
  themeProposalsCount: number
}

type ThemeProposalsQueryVariables = {
  offset: number
  limit: number
  date?: string
  year?: number
  month?: number
  startDate?: string
  endDate?: string
}

type ProposalPeriod = "all" | "day" | "week" | "month"

const PICTOR_CHAN_ICON_URL =
  "https://assets.aipictors.com/pictorchanicon.webp"
const PAGE_SIZE = 12

export default function ThemeProposalsPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [cancelProposal, { loading: isCanceling }] = useMutation(
    CancelThemeProposalMutation,
  )
  const [createThemeProposalLike] = useMutation(CreateThemeProposalLikeMutation)
  const [deleteThemeProposalLike] = useMutation(DeleteThemeProposalLikeMutation)
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null)
  const [expandedProposalIds, setExpandedProposalIds] = useState<string[]>([])

  const period = getPeriod(searchParams.get("period"))
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
      ...filterVariables,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  const proposals = data?.themeProposals ?? []
  const totalCount = data?.themeProposalsCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const filterSummary = getFilterSummary(t, period, dayValue, weekValue, monthValue)

  const updateSearch = (
    update: (params: URLSearchParams) => void,
    options?: { resetPage?: boolean },
  ) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      update(next)

      if (options?.resetPage ?? true) {
        next.set("page", "0")
      }

      return next
    })
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
    await cancelProposal({ variables: { proposalId } })
    toast(t("提案を取り消しました", "Canceled the proposal"))
    setPendingCancelId(null)
    void refetch()
  }

  const onToggleLike = async (proposal: ThemeProposal) => {
    setPendingLikeId(proposal.id)

    try {
      if (proposal.isLiked) {
        await deleteThemeProposalLike({ variables: { proposalId: proposal.id } })
      } else {
        await createThemeProposalLike({ variables: { proposalId: proposal.id } })
      }

      void refetch()
    } finally {
      setPendingLikeId(null)
    }
  }

  const onToggleExpanded = (proposalId: string) => {
    setExpandedProposalIds((current) => {
      if (current.includes(proposalId)) {
        return current.filter((id) => id !== proposalId)
      }

      return [...current, proposalId]
    })
  }

  return (
    <div className="space-y-5 pb-24">
      <AppPageHeader
        title={t("お題提案一覧", "Theme proposals")}
        description={t(
          "提案者とぴくたーちゃんのやり取りを時系列で確認できます。日付・週・月ごとの絞り込みにも対応しています。",
          "Review theme proposal conversations with Pictor-chan, with day, week, and month filters.",
        )}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 p-4 shadow-sm dark:border-orange-900 dark:from-orange-950/30 dark:via-zinc-950 dark:to-amber-950/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t("表示範囲", "Range")}
                </p>
                <Select value={period} onValueChange={(value) => onPeriodChange(value as ProposalPeriod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("すべて", "All")}</SelectItem>
                    <SelectItem value="day">{t("日付", "Day")}</SelectItem>
                    <SelectItem value="week">{t("週", "Week")}</SelectItem>
                    <SelectItem value="month">{t("月", "Month")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t("絞り込み値", "Filter value")}
                </p>

                {period === "day" && (
                  <Input
                    type="date"
                    value={dayValue ?? ""}
                    onChange={(event) => {
                      updateSearch((params) => {
                        params.set("period", "day")
                        if (event.target.value.length > 0) {
                          params.set("day", event.target.value)
                        } else {
                          params.delete("day")
                        }
                        params.delete("week")
                        params.delete("month")
                      })
                    }}
                    className="max-w-sm"
                  />
                )}

                {period === "week" && (
                  <Input
                    type="week"
                    value={weekValue ?? ""}
                    onChange={(event) => {
                      updateSearch((params) => {
                        params.set("period", "week")
                        if (event.target.value.length > 0) {
                          params.set("week", event.target.value)
                        } else {
                          params.delete("week")
                        }
                        params.delete("day")
                        params.delete("month")
                      })
                    }}
                    className="max-w-sm"
                  />
                )}

                {period === "month" && (
                  <Input
                    type="month"
                    value={monthValue ?? ""}
                    onChange={(event) => {
                      updateSearch((params) => {
                        params.set("period", "month")
                        if (event.target.value.length > 0) {
                          params.set("month", event.target.value)
                        } else {
                          params.delete("month")
                        }
                        params.delete("day")
                        params.delete("week")
                      })
                    }}
                    className="max-w-sm"
                  />
                )}

                {period === "all" && (
                  <div className="flex h-10 items-center rounded-md border border-dashed border-orange-200 bg-white/70 px-3 text-sm text-muted-foreground dark:border-orange-900 dark:bg-zinc-950/60">
                    {t("期間指定なし", "No date filter")}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  updateSearch((params) => {
                    params.delete("period")
                    params.delete("day")
                    params.delete("week")
                    params.delete("month")
                  })
                }}
              >
                {t("絞り込み解除", "Clear filter")}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {filterSummary}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {t(`${totalCount}件`, `${totalCount} items`)}
              </Badge>
              {totalPages > 0 && (
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {t(
                    `${currentPage + 1}/${totalPages}ページ`,
                    `Page ${currentPage + 1}/${totalPages}`,
                  )}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end">
          <Button asChild>
            <Link to="/themes/proposals/new">
              {t("お題を提案する", "Submit a proposal")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-950 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100">
        <p className="font-medium dark:text-orange-100">
          {t(
            "保留中のお題案にはログインユーザーがいいねできます。採用判定では X (Grok) が内容に加えていいね数も参考にし、近い案ならいいねが多い案を優先します。",
            "Signed-in users can like pending theme proposals. X (Grok) also considers likes and will prefer higher-liked proposals when ideas are similarly strong.",
          )}
        </p>
        <p className="mt-1 text-xs text-orange-800 dark:text-orange-200/80">
          {t(
            "公平性のため、自分の提案にはいいねできません。",
            "For fairness, you cannot like your own proposal.",
          )}
        </p>
      </div>

      {loading && proposals.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2Icon className="mr-2 animate-spin" />
          {t("読み込み中", "Loading")}
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white/80 px-6 py-14 text-center text-sm text-muted-foreground dark:border-orange-900 dark:bg-zinc-950/60">
          <p className="font-medium text-foreground dark:text-zinc-100">
            {t("条件に合う提案はありません。", "No proposals match this filter.")}
          </p>
          <p className="mt-2">
            {t(
              "別の日付や週・月に切り替えるか、絞り込みを解除してください。",
              "Try another day, week, or month, or clear the filter.",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const targetDate = new Date(`${proposal.targetDate}T00:00:00`)
            const isOwnProposal = authContext.userId === proposal.proposerUserId
            const canLikeProposal =
              authContext.isLoggedIn &&
              !isOwnProposal &&
              proposal.status === "PENDING"
            const isLikeBusy = pendingLikeId === proposal.id
            const isExpanded = expandedProposalIds.includes(proposal.id)

            return (
              <article
                key={proposal.id}
                className="rounded-[28px] border border-orange-200 bg-linear-to-br from-white via-orange-50/75 to-amber-50/90 p-4 shadow-sm dark:border-orange-900 dark:from-zinc-950 dark:via-orange-950/20 dark:to-amber-950/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="px-2.5 py-1 text-[11px]">
                      {format(targetDate, "yyyy/MM/dd (EEE)", { locale: ja })}
                    </Badge>
                    <Badge className={getStatusBadgeClassName(proposal.status)}>
                      {getStatusLabel(t, proposal.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t("提案の会話ログ", "Proposal conversation")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={proposal.isLiked ? "default" : "outline"}
                      size="sm"
                      disabled={!canLikeProposal || isLikeBusy}
                      onClick={() => {
                        void onToggleLike(proposal)
                      }}
                      className="h-8 gap-1.5 rounded-full px-3"
                      title={
                        canLikeProposal
                          ? proposal.isLiked
                            ? t("いいね解除", "Unlike")
                            : t("いいね", "Like")
                          : isOwnProposal
                            ? t("自分の提案にはいいねできません", "You cannot like your own proposal")
                            : t("保留中の提案のみいいねできます", "Only pending proposals can be liked")
                      }
                    >
                      {isLikeBusy ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <Heart className={proposal.isLiked ? "size-3.5 fill-current" : "size-3.5"} />
                      )}
                      <span className="text-[11px]">{proposal.likesCount}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleExpanded(proposal.id)}
                      aria-label={
                        isExpanded
                          ? t("詳細を閉じる", "Collapse details")
                          : t("詳細を開く", "Expand details")
                      }
                      className="size-8 rounded-full"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Link to={`/users/${proposal.proposerUserId}`} className="shrink-0">
                      <Avatar className="size-11 border border-white shadow-sm dark:border-zinc-800">
                        <AvatarImage
                          src={withIconUrlFallback(proposal.proposerIconUrl)}
                          alt={proposal.proposerName}
                        />
                        <AvatarFallback>
                          {proposal.proposerName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Link
                          to={`/users/${proposal.proposerUserId}`}
                          className="line-clamp-1 text-sm font-semibold text-foreground hover:underline dark:text-zinc-100"
                        >
                          {proposal.proposerName}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {t("提案者", "Proposer")}
                        </span>
                      </div>

                      <div className="rounded-[22px] rounded-tl-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950 shadow-sm dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-50">
                        <p className="font-medium">{t("このお題どうですか？", "How about this theme?")}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                          「{proposal.inputTheme}」
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Link to="/pictor-chan" className="shrink-0">
                      <Avatar className="size-11 border border-white bg-white shadow-sm ring-4 ring-orange-100 dark:border-zinc-900 dark:bg-zinc-900 dark:ring-orange-950/40">
                        <AvatarImage
                          src={PICTOR_CHAN_ICON_URL}
                          alt={t("ぴくたーちゃん", "Pictor-chan")}
                        />
                        <AvatarFallback>ぴ</AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Link
                          to="/pictor-chan"
                          className="text-sm font-semibold text-foreground hover:underline dark:text-zinc-100"
                        >
                          {t("ぴくたーちゃん", "Pictor-chan")}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {t("判定コメント", "Response")}
                        </span>
                      </div>

                      <div className="rounded-[22px] rounded-tl-md border border-orange-200 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm dark:border-orange-900 dark:bg-zinc-900/75 dark:text-zinc-100">
                        <p>{getPictorPreviewMessage(t, proposal)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-orange-200/70 pt-4 dark:border-orange-900/70">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-zinc-900/70">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground dark:text-zinc-400">
                          <span>
                            {t("送信", "Submitted")}: {formatUnixTime(proposal.createdAt)}
                          </span>
                          {proposal.decidedAt && (
                            <span>
                              {t("判定", "Decided")}: {formatUnixTime(proposal.decidedAt)}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-sm font-semibold text-foreground dark:text-zinc-100">
                          {proposal.title}
                          {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground dark:text-zinc-300">
                          <span className="font-medium text-foreground dark:text-zinc-100">Prompt:</span>{" "}
                          {proposal.promptName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {proposal.canCancel && (
                          <AlertDialog
                            open={pendingCancelId === proposal.id}
                            onOpenChange={(open) => {
                              setPendingCancelId(open ? proposal.id : null)
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                {t("取り消す", "Cancel")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("提案を取り消しますか？", "Cancel this proposal?")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    "保留中の提案だけ取り消せます。",
                                    "Only pending proposals can be canceled.",
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("戻る", "Back")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onCancel(proposal.id)}
                                  disabled={isCanceling}
                                >
                                  {isCanceling ? t("処理中", "Working") : t("取り消す", "Cancel")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {proposal.status === "ADOPTED" && proposal.adoptedSubjectId && (
                          <Button asChild variant="secondary" size="sm">
                            <Link
                              to={`/themes/${proposal.targetDate.slice(0, 4)}/${Number(proposal.targetDate.slice(5, 7))}/${Number(proposal.targetDate.slice(8, 10))}`}
                            >
                              {t("採用されたお題を見る", "Open adopted theme")}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className="rounded-2xl border border-orange-200 bg-white/80 p-3 shadow-sm dark:border-orange-900 dark:bg-zinc-950/70">
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
            }}
          />
        </div>
      )}
    </div>
  )
}

function formatUnixTime(value: number) {
  return format(new Date(value * 1000), "yyyy/MM/dd HH:mm")
}

function getStatusLabel(
  t: ReturnType<typeof useTranslation>,
  status: string,
) {
  switch (status) {
    case "ADOPTED":
      return t("採用", "Adopted")
    case "REJECTED":
      return t("不採用", "Rejected")
    case "CANCELED":
      return t("取り消し", "Canceled")
    default:
      return t("保留中", "Pending")
  }
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "ADOPTED":
      return "bg-emerald-600 text-white"
    case "REJECTED":
      return "bg-slate-600 text-white"
    case "CANCELED":
      return "bg-rose-600 text-white"
    default:
      return "bg-amber-500 text-white"
  }
}

function getPictorPreviewMessage(
  t: ReturnType<typeof useTranslation>,
  proposal: ThemeProposal,
) {
  if (proposal.decisionComment && proposal.decisionComment.length > 0) {
    return proposal.decisionComment
  }

  switch (proposal.status) {
    case "ADOPTED":
      return t(
        `「${proposal.inputTheme}」を採用したよ。みんなの支持が集まった注目のお題だね。`,
        `I picked "${proposal.inputTheme}". It gathered strong support from everyone.`,
      )
    case "REJECTED":
      return t(
        `今回は「${proposal.inputTheme}」は見送りになったよ。また素敵なお題を待ってるね。`,
        `"${proposal.inputTheme}" was not selected this time, but I would love to see more ideas from you.`,
      )
    default:
      return t(
        `「${proposal.inputTheme}」はどうかな？ いいねが多い提案ほど採用されやすいよ。`,
        `How about "${proposal.inputTheme}"? Proposals with more likes are more likely to be adopted.`,
      )
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
    $date: String
    $year: Int
    $month: Int
    $startDate: String
    $endDate: String
  ) {
    themeProposals(
      offset: $offset
      limit: $limit
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
