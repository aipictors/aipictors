import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client/index"
import { Link, useNavigate } from "@remix-run/react"
import {
  addDays,
  addMonths,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
  subYears,
} from "date-fns"
import { ja } from "date-fns/locale"
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AppPageHeader } from "~/components/app/app-page-header"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { createCalendarCells } from "~/routes/($lang)._main.themes._index/utils/create-calendar-cells"
import { getJstDate } from "~/utils/jst-date"

type MutationData = {
  createThemeProposal: {
    id: string
    title: string
    targetDate: string
  }
}

type DailyTheme = {
  id: string
  title: string
  dateText: string
  year: number
  month: number
  day: number
}

type DailyThemesQueryData = {
  dailyThemes: DailyTheme[]
}

type DuplicateCheckQueryData = {
  themeProposalDuplicateThemes: DailyTheme[]
}

type CalendarThemeProposal = {
  id: string
  inputTheme: string
  title: string
  enTitle: string
  targetDate: string
  status: string
  proposerUserId: string
  proposerName: string
  createdAt: number
  likesCount: number
}

type CalendarThemeProposalsQueryData = {
  themeProposals: CalendarThemeProposal[]
}

export default function NewThemeProposalPage() {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const today = startOfDay(getJstDate(new Date()))
  const minimumProposalDate = addDays(today, 8)
  const [date, setDate] = useState(format(minimumProposalDate, "yyyy-MM-dd"))
  const [theme, setTheme] = useState("")
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today))
  const [checkedTheme, setCheckedTheme] = useState<string | null>(null)

  const [createThemeProposal, { loading, error }] = useMutation<MutationData>(
    CreateThemeProposalMutation,
  )
  const { data: calendarData, loading: isCalendarLoading } =
    useQuery<DailyThemesQueryData>(DailyThemesQuery, {
      variables: {
        offset: 0,
        limit: 62,
        where: {
          year: visibleMonth.getFullYear(),
          month: visibleMonth.getMonth() + 1,
          orderBy: "DATE_STARTED",
          sort: "ASC",
        },
      },
      fetchPolicy: "cache-and-network",
    })
  const { data: proposalCalendarData, loading: isProposalCalendarLoading } =
    useQuery<CalendarThemeProposalsQueryData>(CalendarThemeProposalsQuery, {
      variables: {
        offset: 0,
        limit: 200,
        year: visibleMonth.getFullYear(),
        month: visibleMonth.getMonth() + 1,
      },
      fetchPolicy: "cache-and-network",
    })
  const [runDuplicateCheck, duplicateCheck] = useLazyQuery<DuplicateCheckQueryData>(
    ThemeProposalDuplicateThemesQuery,
    {
      fetchPolicy: "no-cache",
    },
  )
  const [selectedProposalDate, setSelectedProposalDate] = useState<string | null>(null)

  const dailyThemes = calendarData?.dailyThemes ?? []
  const monthThemeProposals = proposalCalendarData?.themeProposals ?? []
  const duplicateThemes = checkedTheme === theme.trim()
    ? (duplicateCheck.data?.themeProposalDuplicateThemes ?? [])
    : []
  const duplicateCount3Months = duplicateThemes.filter((item) => {
    return parseISO(item.dateText) >= subMonths(today, 3)
  }).length
  const duplicateCount6Months = duplicateThemes.filter((item) => {
    return parseISO(item.dateText) >= subMonths(today, 6)
  }).length
  const duplicateCount1Year = duplicateThemes.filter((item) => {
    return parseISO(item.dateText) >= subYears(today, 1)
  }).length

  const cells = createCalendarCells(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
  )
  const proposalsByDate = monthThemeProposals.reduce(
    (map, proposal) => {
      const items = map.get(proposal.targetDate) ?? []
      items.push(proposal)
      map.set(proposal.targetDate, items)
      return map
    },
    new Map<string, CalendarThemeProposal[]>(),
  )
  const selectedDateProposals = selectedProposalDate
    ? (proposalsByDate.get(selectedProposalDate) ?? [])
    : []

  const onSubmit = async () => {
    if (!theme.trim()) {
      return
    }

    const result = await createThemeProposal({
      variables: {
        date: date,
        theme: theme.trim(),
      },
    })

    toast(t("提案を送信しました", "Submitted the proposal"))
    navigate("/themes/proposals")
  }

  const onSelectDate = (value: string) => {
    setDate(value)
  }

  const onDateChange = (value: string) => {
    setDate(value)

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setVisibleMonth(startOfMonth(parseISO(value)))
    }
  }

  const onCheckDuplicates = async () => {
    if (!theme.trim()) {
      return
    }

    await runDuplicateCheck({
      variables: {
        theme: theme.trim(),
      },
    })

    setCheckedTheme(theme.trim())
  }

  return (
    <div className="space-y-4">
      <AppPageHeader
        title={t("お題を提案する", "Submit a theme proposal")}
        description={t(
          "カレンダーで過去のお題と7日後までの予定を見ながら、8日後以降のお題を提案できます。",
          "Browse past themes and the next seven days in a calendar, then submit proposals for day eight onward.",
        )}
      />

      <div className="flex justify-end">
        <Button asChild variant="secondary">
          <Link to="/themes/proposals">{t("一覧へ戻る", "Back to list")}</Link>
        </Button>
      </div>

      {!authContext.isLoading && authContext.isNotLoggedIn && (
        <Alert>
          <AlertDescription>
            {t("提案するにはログインが必要です。", "You need to sign in to submit a proposal.")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.3fr]">
        <Card className="border-orange-200 bg-linear-to-br from-orange-50 via-background to-amber-50 dark:border-orange-800 dark:from-orange-950/35 dark:via-zinc-950 dark:to-amber-950/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-zinc-50">
              <SparklesIcon className="size-4" />
              {t("提案内容", "Proposal")}
            </CardTitle>
            <CardDescription className="dark:text-zinc-400">
              {t(
                "英語でも日本語でも送信できます。送信時に翻訳とタイトル整形を行います。",
                "You can submit in Japanese or English. Translation and title normalization will run on submit.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-orange-200 bg-white/80 p-4 shadow-sm dark:border-orange-800 dark:bg-zinc-900/80">
              <p className="text-muted-foreground text-xs dark:text-zinc-400">
                {t("選択中の対象日", "Selected target date")}
              </p>
              <div className="mt-2 flex items-center gap-2 overflow-hidden">
                <CalendarDaysIcon className="size-4 text-orange-500 dark:text-orange-300" />
                <p className="truncate whitespace-nowrap font-semibold text-lg dark:text-zinc-50">
                  {format(parseISO(date), "yyyy/MM/dd (EEE)", { locale: ja })}
                </p>
              </div>
              <p className="mt-2 whitespace-nowrap text-muted-foreground text-xs dark:text-zinc-400">
                {t(
                  `提案できる最短日は ${format(minimumProposalDate, "yyyy/MM/dd")} です。`,
                  `The earliest proposal date is ${format(minimumProposalDate, "yyyy/MM/dd")}.`,
                )}
              </p>
            </div>

            <Alert>
              <AlertDescription>
                {t(
                  "提案一覧ではログインユーザーが保留中の案にいいねできます。採用判定では X (Grok) が内容に加えていいね数も参考にし、近い案ならいいねの多い案を優先します。",
                  "Signed-in users can like pending proposals in the list. X (Grok) also considers likes during adoption and will prefer higher-liked proposals when candidates are otherwise close.",
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="proposal-date">
                {t("対象日", "Target date")}
              </label>
              <Input
                id="proposal-date"
                type="date"
                value={date}
                min={format(minimumProposalDate, "yyyy-MM-dd")}
                onChange={(event) => onDateChange(event.target.value)}
                disabled={authContext.isNotLoggedIn || loading}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="proposal-theme">
                {t("お題", "Theme")}
              </label>
              <Textarea
                id="proposal-theme"
                placeholder={t(
                  "例: 雨上がりの商店街、retro rainy arcade など",
                  "Example: Neon rainy arcade, post-rain shopping street",
                )}
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                disabled={authContext.isNotLoggedIn || loading}
                rows={5}
              />
            </div>

            <div className="rounded-3xl border bg-background/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-sm dark:text-zinc-100">
                    {t("過去の重複チェック", "Duplicate history check")}
                  </p>
                  <p className="text-muted-foreground text-xs dark:text-zinc-400">
                    {t(
                      "過去1年の公式お題から同じ内容を探します。重複しても送信はできます。",
                      "Search the last year of official themes for the same idea. Matching entries do not block submission.",
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCheckDuplicates}
                  disabled={authContext.isNotLoggedIn || loading || duplicateCheck.loading || theme.trim().length < 2}
                >
                  {duplicateCheck.loading ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t("確認中", "Checking")}
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 size-4" />
                      {t("重複を確認", "Check duplicates")}
                    </>
                  )}
                </Button>
              </div>

              {duplicateCheck.error && (
                <Alert variant="destructive" className="mt-3">
                  <AlertDescription>{duplicateCheck.error.message}</AlertDescription>
                </Alert>
              )}

              {checkedTheme !== null && checkedTheme === theme.trim() && (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <DuplicateSummaryCard
                      label={t("3ヶ月以内", "Within 3 months")}
                      count={duplicateCount3Months}
                    />
                    <DuplicateSummaryCard
                      label={t("6ヶ月以内", "Within 6 months")}
                      count={duplicateCount6Months}
                    />
                    <DuplicateSummaryCard
                      label={t("1年以内", "Within 1 year")}
                      count={duplicateCount1Year}
                    />
                  </div>

                  {duplicateThemes.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                      {t(
                        "直近1年では同じお題は見つかりませんでした。",
                        "No matching theme was found in the past year.",
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                      <p className="font-medium text-sm dark:text-zinc-100">
                        {t("一致した開催日", "Matching dates")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {duplicateThemes.map((item) => (
                          <Link
                            key={item.id}
                            to={`/themes/${item.year}/${item.month}/${item.day}`}
                            className="max-w-full truncate whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100 dark:hover:bg-orange-950/60"
                            title={`${format(parseISO(item.dateText), "yyyy/MM/dd", { locale: ja })} · ${item.title}`}
                          >
                            {format(parseISO(item.dateText), "yyyy/MM/dd", { locale: ja })}
                            {" · "}
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {checkedTheme !== null && checkedTheme !== theme.trim() && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-muted-foreground text-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
                  <AlertCircleIcon className="size-4" />
                  {t(
                    "お題の内容が変わったので、必要ならもう一度重複チェックしてください。",
                    "The theme text changed. Run duplicate check again if needed.",
                  )}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={onSubmit}
                disabled={authContext.isNotLoggedIn || loading || theme.trim().length === 0}
              >
                {loading ? t("送信中", "Submitting") : t("提案を送信", "Submit proposal")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-sky-200 bg-linear-to-br from-sky-50 via-background to-cyan-50 dark:border-sky-800 dark:from-sky-950/35 dark:via-zinc-950 dark:to-cyan-950/25">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="dark:text-zinc-50">{t("お題カレンダー", "Theme calendar")}</CardTitle>
                <CardDescription className="dark:text-zinc-400">
                  {t(
                    "過去のお題と7日後までの予定を見ながら、8日後以降のセルを選べます。",
                    "Browse past themes and the next seven days, then pick any cell from day eight onward.",
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <div className="min-w-28 whitespace-nowrap text-center font-semibold text-sm dark:text-zinc-100">
                  {format(visibleMonth, "yyyy年M月", { locale: ja })}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="whitespace-nowrap">{t("過去と7日後まで", "Past to +7 days")}</Badge>
              <Badge className="whitespace-nowrap bg-emerald-600 text-white">{t("未提案", "No proposals yet")}</Badge>
              <Badge className="whitespace-nowrap bg-amber-500 text-white">{t("提案あり", "Has proposals")}</Badge>
              <Badge className="whitespace-nowrap bg-slate-500 text-white">{t("受付前", "Not open yet")}</Badge>
            </div>

            <p className="text-muted-foreground text-xs dark:text-zinc-400">
              {t(
                "8日後以降の日付は、未提案と提案ありで色分けしています。提案ありの日付では件数ボタンから日別一覧を開けます。",
                "Dates from day eight onward are color-coded by whether proposals already exist. Use the count button to open the per-day list.",
              )}
            </p>

            {isCalendarLoading && isProposalCalendarLoading && dailyThemes.length === 0 && monthThemeProposals.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center text-muted-foreground">
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {t("カレンダーを読み込み中", "Loading calendar")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid min-w-[320px] grid-cols-7 gap-2">
                  {["日", "月", "火", "水", "木", "金", "土"].map((weekDay) => (
                    <div key={weekDay} className="pb-1 text-center font-medium text-muted-foreground text-xs">
                      {weekDay}
                    </div>
                  ))}
                  {cells.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square rounded-3xl bg-white/20 dark:bg-zinc-900/20" />
                    }

                    const cellDate = new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    )
                    const dateText = format(cellDate, "yyyy-MM-dd")
                    const themeForDay = dailyThemes.find((item) => item.dateText === dateText)
                    const proposalsForDay = proposalsByDate.get(dateText) ?? []
                    const hasProposals = proposalsForDay.length > 0
                    const isSelectable = !isBefore(cellDate, minimumProposalDate)
                    const isSelected = dateText === date
                    const isHistoryWindow = isBefore(cellDate, minimumProposalDate)
                    const cellStatusLabel = isSelectable
                      ? hasProposals
                        ? t("提案あり", "Has proposals")
                        : t("未提案", "No proposals")
                      : isHistoryWindow
                        ? t("公開中", "Visible")
                        : t("受付前", "Closed")

                    return (
                      <div
                        key={dateText}
                        role={isSelectable ? "button" : undefined}
                        tabIndex={isSelectable ? 0 : undefined}
                        onClick={() => {
                          if (!isSelectable) {
                            return
                          }

                          onSelectDate(dateText)
                        }}
                        onKeyDown={(event) => {
                          if (!isSelectable) {
                            return
                          }

                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onSelectDate(dateText)
                          }
                        }}
                        className={cn(
                          "relative flex aspect-square flex-col rounded-3xl border p-2 text-left transition",
                          {
                            "cursor-pointer border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-100": isSelectable && !hasProposals,
                            "cursor-pointer border-amber-400 bg-amber-50 shadow-sm dark:border-amber-700 dark:bg-amber-950/35 dark:text-amber-100": isSelectable && hasProposals,
                            "cursor-default border-slate-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100": !isSelectable,
                            "ring-2 ring-orange-400 dark:ring-orange-500": isSelected,
                          },
                        )}
                      >
                        <div className="flex items-start justify-between gap-1 overflow-hidden">
                          <span className="font-semibold text-sm">{day}</span>
                          {isSelectable ? (
                            <Badge
                              className={cn(
                                "h-5 whitespace-nowrap px-1.5 text-[10px] text-white",
                                hasProposals ? "bg-amber-500" : "bg-emerald-600",
                              )}
                            >
                              {cellStatusLabel}
                            </Badge>
                          ) : (
                            <Badge className="h-5 whitespace-nowrap bg-slate-500 px-1.5 text-[10px] text-white">
                              {cellStatusLabel}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 flex-1 text-[11px] leading-4">
                          {themeForDay && isHistoryWindow ? (
                            <>
                              <p className="truncate whitespace-nowrap font-medium" title={themeForDay.title}>{themeForDay.title}</p>
                              <p className="mt-1 truncate whitespace-nowrap text-muted-foreground text-[10px] dark:text-zinc-400">
                                {t("過去または近日公開のお題", "Past or upcoming official theme")}
                              </p>
                            </>
                          ) : isSelectable && hasProposals ? (
                            <>
                              <p className="truncate whitespace-nowrap font-medium text-amber-800 text-xs dark:text-amber-200">
                                {t("この日に提案があります", "Proposals already submitted")}
                              </p>
                              <p className="mt-1 truncate whitespace-nowrap text-[10px] text-amber-700/80 dark:text-amber-200/80">
                                {t(
                                  `${proposalsForDay.length}件の提案が集まっています。`,
                                  `${proposalsForDay.length} proposals already exist for this date.`,
                                )}
                              </p>
                            </>
                          ) : isSelectable ? (
                            <p className="truncate whitespace-nowrap text-emerald-700 text-xs dark:text-emerald-300">
                              {t("この日付に提案できます", "You can propose for this date")}
                            </p>
                          ) : (
                            <p className="truncate whitespace-nowrap text-muted-foreground text-xs dark:text-zinc-400">
                              {t("この期間は既存お題の確認用です", "This period is for checking official themes")}
                            </p>
                          )}
                        </div>

                        {hasProposals && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-6 rounded-full px-2 text-[10px]"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedProposalDate(dateText)
                              }}
                            >
                              {t(
                                `${proposalsForDay.length}件を見る`,
                                `View ${proposalsForDay.length}`,
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <Dialog
              open={selectedProposalDate !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedProposalDate(null)
                }
              }}
            >
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProposalDate
                      ? t(
                          `${format(parseISO(selectedProposalDate), "yyyy/MM/dd (EEE)", { locale: ja })} の提案一覧`,
                          `Proposals for ${format(parseISO(selectedProposalDate), "yyyy/MM/dd (EEE)", { locale: ja })}`,
                        )
                      : t("提案一覧", "Proposal list")}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "この日付に送られている提案を確認できます。内容を見たうえで別案を出すか判断できます。",
                      "Review the proposals already submitted for this date before deciding whether to submit an alternative.",
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
                  {selectedDateProposals.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-4 text-center text-muted-foreground text-sm dark:border-zinc-700 dark:text-zinc-400">
                      {t("この日付の提案はまだありません。", "There are no proposals for this date yet.")}
                    </div>
                  ) : (
                    selectedDateProposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/20"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={getProposalStatusBadgeClassName(proposal.status)}>
                            {getProposalStatusLabel(t, proposal.status)}
                          </Badge>
                          <Badge variant="outline" className="px-2 py-0 text-[11px]">
                            {t("いいね", "Likes")}: {proposal.likesCount}
                          </Badge>
                          <span className="text-muted-foreground text-[11px] dark:text-zinc-400">
                            {t("提案者", "Proposer")}: {proposal.proposerName}
                          </span>
                          <span className="text-muted-foreground text-[11px] dark:text-zinc-400">
                            {t("送信", "Submitted")}: {formatUnixTime(proposal.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 font-semibold text-sm leading-5 dark:text-zinc-50">
                          {proposal.inputTheme}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground dark:text-zinc-400">
                          {proposal.title}
                          {proposal.enTitle.length > 0 && ` / ${proposal.enTitle}`}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DuplicateSummaryCard(props: { label: string, count: number }) {
  return (
    <div className="rounded-2xl border bg-white p-3 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <p className="text-muted-foreground text-xs dark:text-zinc-400">{props.label}</p>
      <p className="mt-1 font-semibold text-2xl dark:text-zinc-50">{props.count}</p>
    </div>
  )
}

const DailyThemesQuery = gql`
  query ProposalCalendarDailyThemes($offset: Int!, $limit: Int!, $where: DailyThemesWhereInput!) {
    dailyThemes(offset: $offset, limit: $limit, where: $where) {
      id
      title
      dateText
      year
      month
      day
    }
  }
`

const ThemeProposalDuplicateThemesQuery = gql`
  query ThemeProposalDuplicateThemes($theme: String!) {
    themeProposalDuplicateThemes(theme: $theme) {
      id
      title
      dateText
      year
      month
      day
    }
  }
`

const CalendarThemeProposalsQuery = gql`
  query ProposalCalendarThemeProposals($offset: Int!, $limit: Int!, $year: Int!, $month: Int!) {
    themeProposals(offset: $offset, limit: $limit, year: $year, month: $month) {
      id
      inputTheme
      title
      enTitle
      targetDate
      status
      proposerUserId
      proposerName
      createdAt
      likesCount
    }
  }
`

const CreateThemeProposalMutation = gql`
  mutation CreateThemeProposal($date: String!, $theme: String!) {
    createThemeProposal(date: $date, theme: $theme) {
      id
      title
      targetDate
    }
  }
`

function getProposalStatusLabel(
  t: ReturnType<typeof useTranslation>,
  status: string,
) {
  switch (status) {
    case "ADOPTED":
      return t("採用", "Adopted")
    case "REJECTED":
      return t("不採用", "Rejected")
    default:
      return t("保留中", "Pending")
  }
}

function getProposalStatusBadgeClassName(status: string) {
  switch (status) {
    case "ADOPTED":
      return "bg-emerald-600 text-white"
    case "REJECTED":
      return "bg-slate-600 text-white"
    default:
      return "bg-amber-500 text-white"
  }
}

function formatUnixTime(value: number) {
  return format(new Date(value * 1000), "yyyy/MM/dd HH:mm")
}
