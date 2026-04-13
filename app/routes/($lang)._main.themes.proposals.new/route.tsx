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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
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
  allowOtherDate: boolean
  note?: string | null
}

type CalendarThemeProposalsQueryData = {
  themeProposals: CalendarThemeProposal[]
}

type CalendarCell =
  | {
      key: string
      isEmpty: true
    }
  | {
      key: string
      isEmpty: false
      day: number
      dateText: string
      weekDayLabel: string
      themeForDay?: DailyTheme
      proposalsForDay: CalendarThemeProposal[]
      hasAdoptedProposal: boolean
      hasProposals: boolean
      isSelectable: boolean
      isSelected: boolean
      isHistoryWindow: boolean
      cellStatusLabel: string
    }

type FilledCalendarCell = Extract<CalendarCell, { isEmpty: false }>

type MobileCalendarFilter = "ALL" | "NO_PROPOSALS" | "HAS_PROPOSALS" | "ADOPTED"

export default function NewThemeProposalPage() {
  const t = useTranslation()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const today = startOfDay(getJstDate(new Date()))
  const minimumProposalDate = addDays(today, 8)
  const [date, setDate] = useState(format(minimumProposalDate, "yyyy-MM-dd"))
  const [theme, setTheme] = useState("")
  const [allowOtherDate, setAllowOtherDate] = useState(true)
  const [note, setNote] = useState("")
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today))
  const [checkedTheme, setCheckedTheme] = useState<string | null>(null)
  const [selectedProposalDate, setSelectedProposalDate] = useState<string | null>(null)
  const [mobileCalendarFilter, setMobileCalendarFilter] = useState<MobileCalendarFilter>("ALL")

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
  const calendarCells: CalendarCell[] = cells.map((day, index) => {
    if (day === null) {
      return {
        key: `empty-${index}`,
        isEmpty: true,
      }
    }

    const cellDate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    )
    const dateText = format(cellDate, "yyyy-MM-dd")
    const themeForDay = dailyThemes.find((item) => item.dateText === dateText)
    const proposalsForDay = proposalsByDate.get(dateText) ?? []
    const hasAdoptedProposal = proposalsForDay.some((proposal) => {
      return proposal.status === "ADOPTED"
    })
    const hasProposals = proposalsForDay.length > 0
    const isSelectable = !isBefore(cellDate, minimumProposalDate) && !hasAdoptedProposal
    const isSelected = dateText === date
    const isHistoryWindow = isBefore(cellDate, minimumProposalDate)
    const cellStatusLabel = isSelectable
      ? hasProposals
        ? t("提案あり", "Has proposals")
        : t("未提案", "No proposals")
      : hasAdoptedProposal
        ? t("採用済み", "Adopted")
        : isHistoryWindow
          ? t("公開中", "Visible")
          : t("受付前", "Closed")

    return {
      key: dateText,
      isEmpty: false,
      day: day,
      dateText: dateText,
      weekDayLabel: format(cellDate, "EEE", { locale: ja }),
      themeForDay: themeForDay,
      proposalsForDay: proposalsForDay,
      hasAdoptedProposal: hasAdoptedProposal,
      hasProposals: hasProposals,
      isSelectable: isSelectable,
      isSelected: isSelected,
      isHistoryWindow: isHistoryWindow,
      cellStatusLabel: cellStatusLabel,
    }
  })
  const mobileCalendarDays = calendarCells.filter((cell): cell is FilledCalendarCell => {
    return !cell.isEmpty
  })
  const filteredMobileCalendarDays = mobileCalendarDays.filter((cell) => {
    if (mobileCalendarFilter === "NO_PROPOSALS") {
      return cell.isSelectable && !cell.hasProposals
    }

    if (mobileCalendarFilter === "HAS_PROPOSALS") {
      return cell.isSelectable && cell.hasProposals
    }

    if (mobileCalendarFilter === "ADOPTED") {
      return cell.hasAdoptedProposal
    }

    return true
  })
  const selectedDateProposals = selectedProposalDate
    ? (proposalsByDate.get(selectedProposalDate) ?? [])
    : []
  const selectedTargetDateProposals = proposalsByDate.get(date) ?? []
  const selectedDateHasAdoptedProposal = selectedTargetDateProposals.some((proposal) => {
    return proposal.status === "ADOPTED"
  })

  const onSubmit = async () => {
    if (!theme.trim()) {
      return
    }

    if (selectedDateHasAdoptedProposal) {
      toast.error(
        t(
          "この日付は採用済みのお題があるため選択できません。別の日付を選んでください。",
          "This date already has an adopted theme and cannot be selected. Please choose another date.",
        ),
      )
      return
    }

    await createThemeProposal({
      variables: {
        date: date,
        theme: theme.trim(),
        allowOtherDate: allowOtherDate,
        note: note.trim().length > 0 ? note.trim() : undefined,
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

            {selectedDateHasAdoptedProposal && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t(
                    "この日付には採用済みのお題があります。別の日付を選んでください。",
                    "This date already has an adopted theme. Please choose another date.",
                  )}
                </AlertDescription>
              </Alert>
            )}

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
              <div className="flex items-start gap-3">
                <Checkbox
                  id="proposal-allow-other-date"
                  checked={allowOtherDate}
                  onCheckedChange={(checked) => setAllowOtherDate(checked !== false)}
                  disabled={authContext.isNotLoggedIn || loading}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    className="font-medium text-sm"
                    htmlFor="proposal-allow-other-date"
                  >
                    {t("他の日でもOK", "Other dates are also OK")}
                  </label>
                  <p className="text-muted-foreground text-xs dark:text-zinc-400">
                    {t(
                      "ON の場合、この日が見送りでも未提案の別日に回して採用候補として検討します。記念日っぽい日は避けます。",
                      "When enabled, even if this date is not selected, the proposal can still be reconsidered for another future date with no proposals yet. Anniversary-like dates are avoided.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm" htmlFor="proposal-note">
                {t("備考", "Note")}
              </label>
              <Textarea
                id="proposal-note"
                placeholder={t(
                  "例: 季節感は秋寄りでお願いします、人物以外だと参加しやすいと思います など",
                  "Example: Autumn mood would fit well, or non-character themes may be easier to join",
                )}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={authContext.isNotLoggedIn || loading}
                rows={4}
                maxLength={500}
              />
              <p className="text-muted-foreground text-xs dark:text-zinc-400">
                {t(
                  "補足条件や意図があれば書いてください。採用判定でも参考にします。",
                  "Add any constraints or intent here. It will also be considered during adoption.",
                )}
              </p>
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
                disabled={authContext.isNotLoggedIn || loading || theme.trim().length === 0 || selectedDateHasAdoptedProposal}
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
              <Badge className="whitespace-nowrap bg-rose-600 text-white">{t("採用済み", "Adopted")}</Badge>
              <Badge className="whitespace-nowrap bg-slate-500 text-white">{t("受付前", "Not open yet")}</Badge>
            </div>

            <p className="text-muted-foreground text-xs dark:text-zinc-400">
              {t(
                "8日後以降の日付は、未提案と提案ありで色分けしています。提案ありの日付では件数ボタンから日別一覧を開けます。",
                "Dates from day eight onward are color-coded by whether proposals already exist. Use the count button to open the per-day list.",
              )}
            </p>

            <p className="text-muted-foreground text-xs md:hidden dark:text-zinc-400">
              {t(
                "スマホでは1日ごとのカード一覧で表示しています。文字が見やすい大きさで、タップしやすくしています。",
                "On phones, the calendar is shown as a daily card list with larger text and tap targets.",
              )}
            </p>

            <div className="md:hidden">
              <div className="flex flex-wrap gap-2">
                {getMobileCalendarFilters(t).map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={mobileCalendarFilter === filter.value ? "default" : "secondary"}
                    className="rounded-full px-3 text-xs"
                    onClick={() => setMobileCalendarFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {isCalendarLoading && isProposalCalendarLoading && dailyThemes.length === 0 && monthThemeProposals.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center text-muted-foreground">
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {t("カレンダーを読み込み中", "Loading calendar")}
              </div>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filteredMobileCalendarDays.length === 0 ? (
                    <div className="rounded-3xl border border-dashed bg-background/70 p-4 text-sm text-muted-foreground dark:border-zinc-800 dark:text-zinc-400">
                      {t(
                        "この条件に一致する日付はありません。フィルタを切り替えて確認してください。",
                        "No dates match this filter. Change the filter to view other dates.",
                      )}
                    </div>
                  ) : (
                    filteredMobileCalendarDays.map((cell) => (
                      <div
                        key={cell.key}
                        role={cell.isSelectable ? "button" : undefined}
                        tabIndex={cell.isSelectable ? 0 : undefined}
                        onClick={() => {
                          if (!cell.isSelectable) {
                            return
                          }

                          onSelectDate(cell.dateText)
                        }}
                        onKeyDown={(event) => {
                          if (!cell.isSelectable) {
                            return
                          }

                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onSelectDate(cell.dateText)
                          }
                        }}
                        className={getCalendarCellCardClassName(cell, true)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-base leading-none">
                              {format(parseISO(cell.dateText), "M/d", { locale: ja })}
                              <span className="ml-2 text-muted-foreground text-sm dark:text-zinc-400">
                                ({cell.weekDayLabel})
                              </span>
                            </p>
                            <p className="mt-2 text-muted-foreground text-xs dark:text-zinc-400">
                              {format(parseISO(cell.dateText), "yyyy/MM/dd", { locale: ja })}
                            </p>
                          </div>
                          <Badge className={getCalendarCellBadgeClassName(cell)}>
                            {cell.cellStatusLabel}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <p className={getCalendarCellHeadlineClassName(cell)}>
                            {getCalendarCellHeadline(t, cell)}
                          </p>
                          <p className={getCalendarCellDescriptionClassName(cell)}>
                            {getCalendarCellDescription(t, cell)}
                          </p>
                        </div>

                        {cell.hasProposals && (
                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-9 rounded-full px-3 text-xs"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedProposalDate(cell.dateText)
                              }}
                            >
                              {t(
                                `${cell.proposalsForDay.length}件の提案を見る`,
                                `View ${cell.proposalsForDay.length} proposals`,
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <div className="grid min-w-[700px] grid-cols-7 gap-2">
                    {["日", "月", "火", "水", "木", "金", "土"].map((weekDay) => (
                      <div key={weekDay} className="pb-1 text-center font-medium text-muted-foreground text-xs">
                        {weekDay}
                      </div>
                    ))}
                    {calendarCells.map((cell) => {
                      if (cell.isEmpty) {
                        return <div key={cell.key} className="aspect-square rounded-3xl bg-white/20 dark:bg-zinc-900/20" />
                      }

                      return (
                        <div
                          key={cell.key}
                          role={cell.isSelectable ? "button" : undefined}
                          tabIndex={cell.isSelectable ? 0 : undefined}
                          onClick={() => {
                            if (!cell.isSelectable) {
                              return
                            }

                            onSelectDate(cell.dateText)
                          }}
                          onKeyDown={(event) => {
                            if (!cell.isSelectable) {
                              return
                            }

                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              onSelectDate(cell.dateText)
                            }
                          }}
                          className={getCalendarCellCardClassName(cell, false)}
                        >
                          <div className="flex items-start justify-between gap-1 overflow-hidden">
                            <span className="font-semibold text-sm">{cell.day}</span>
                            <Badge className={getCalendarCellBadgeClassName(cell)}>
                              {cell.cellStatusLabel}
                            </Badge>
                          </div>

                          <div className="mt-2 flex-1 text-[11px] leading-4">
                            <p className={getCalendarCellHeadlineClassName(cell)} title={getCalendarCellHeadline(t, cell)}>
                              {getCalendarCellHeadline(t, cell)}
                            </p>
                            <p className="mt-1 truncate whitespace-nowrap text-[10px] text-muted-foreground dark:text-zinc-400">
                              {getCalendarCellDescription(t, cell)}
                            </p>
                          </div>

                          {cell.hasProposals && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-6 rounded-full px-2 text-[10px]"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedProposalDate(cell.dateText)
                                }}
                              >
                                {t(
                                  `${cell.proposalsForDay.length}件を見る`,
                                  `View ${cell.proposalsForDay.length}`,
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
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
                          {proposal.allowOtherDate && (
                            <Badge variant="outline" className="px-2 py-0 text-[11px]">
                              {t("他の日でもOK", "Other dates OK")}
                            </Badge>
                          )}
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
                        {proposal.note && proposal.note.length > 0 && (
                          <div className="mt-2 rounded-xl border border-amber-200/80 bg-white/80 px-3 py-2 text-[11px] leading-5 text-slate-700 dark:border-amber-900/70 dark:bg-zinc-900/70 dark:text-zinc-200">
                            <p className="font-medium">{t("備考", "Note")}</p>
                            <p className="mt-1 whitespace-pre-wrap">{proposal.note}</p>
                          </div>
                        )}
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

function getMobileCalendarFilters(t: ReturnType<typeof useTranslation>): Array<{
  value: MobileCalendarFilter
  label: string
}> {
  return [
    {
      value: "ALL",
      label: t("すべて", "All"),
    },
    {
      value: "NO_PROPOSALS",
      label: t("未提案", "No proposals yet"),
    },
    {
      value: "HAS_PROPOSALS",
      label: t("提案あり", "Has proposals"),
    },
    {
      value: "ADOPTED",
      label: t("採用済み", "Adopted"),
    },
  ]
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
      allowOtherDate
      note
    }
  }
`

const CreateThemeProposalMutation = gql`
  mutation CreateThemeProposal($date: String!, $theme: String!, $allowOtherDate: Boolean, $note: String) {
    createThemeProposal(
      date: $date
      theme: $theme
      allowOtherDate: $allowOtherDate
      note: $note
    ) {
      id
      title
      targetDate
    }
  }
`

function getCalendarCellCardClassName(cell: FilledCalendarCell, isMobile: boolean) {
  return cn(
    "relative rounded-3xl border text-left transition",
    isMobile ? "p-4" : "flex aspect-square flex-col p-2",
    {
      "cursor-pointer border-emerald-500 bg-emerald-50 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-100": cell.isSelectable && !cell.hasProposals,
      "cursor-pointer border-amber-400 bg-amber-50 shadow-sm dark:border-amber-700 dark:bg-amber-950/35 dark:text-amber-100": cell.isSelectable && cell.hasProposals,
      "cursor-default border-rose-300 bg-rose-50 shadow-sm dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100": cell.hasAdoptedProposal,
      "cursor-default border-slate-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100": !cell.isSelectable && !cell.hasAdoptedProposal,
      "ring-2 ring-orange-400 dark:ring-orange-500": cell.isSelected,
    },
  )
}

function getCalendarCellBadgeClassName(cell: FilledCalendarCell) {
  return cn("whitespace-nowrap text-white h-5 px-1.5 text-[10px]", {
    "bg-emerald-600": cell.isSelectable && !cell.hasProposals,
    "bg-amber-500": cell.isSelectable && cell.hasProposals,
    "bg-rose-600": cell.hasAdoptedProposal,
    "bg-slate-500": !cell.isSelectable && !cell.hasAdoptedProposal,
  })
}

function getCalendarCellHeadlineClassName(cell: FilledCalendarCell) {
  return cn("font-medium", {
    "text-emerald-700 dark:text-emerald-300": cell.isSelectable && !cell.hasProposals,
    "text-amber-800 dark:text-amber-200": cell.isSelectable && cell.hasProposals,
    "text-rose-800 dark:text-rose-200": cell.hasAdoptedProposal,
    "text-zinc-900 dark:text-zinc-100": cell.themeForDay && cell.isHistoryWindow,
    "text-muted-foreground dark:text-zinc-400": !cell.isSelectable && !cell.hasAdoptedProposal && !(cell.themeForDay && cell.isHistoryWindow),
  })
}

function getCalendarCellDescriptionClassName(cell: FilledCalendarCell) {
  return cn("text-sm leading-5", {
    "text-emerald-700/80 dark:text-emerald-200/90": cell.isSelectable && !cell.hasProposals,
    "text-amber-700/80 dark:text-amber-200/80": cell.isSelectable && cell.hasProposals,
    "text-rose-700/80 dark:text-rose-200/80": cell.hasAdoptedProposal,
    "text-muted-foreground dark:text-zinc-400": !cell.isSelectable && !cell.hasAdoptedProposal,
  })
}

function getCalendarCellHeadline(
  t: ReturnType<typeof useTranslation>,
  cell: FilledCalendarCell,
) {
  if (cell.themeForDay && cell.isHistoryWindow) {
    return cell.themeForDay.title
  }

  if (cell.hasAdoptedProposal) {
    return t("採用済みのお題があります", "An adopted theme already exists")
  }

  if (cell.isSelectable && cell.hasProposals) {
    return t("この日に提案があります", "Proposals already submitted")
  }

  if (cell.isSelectable) {
    return t("この日付に提案できます", "You can propose for this date")
  }

  return t("この期間は既存お題の確認用です", "This period is for checking official themes")
}

function getCalendarCellDescription(
  t: ReturnType<typeof useTranslation>,
  cell: FilledCalendarCell,
) {
  if (cell.themeForDay && cell.isHistoryWindow) {
    return t("過去または近日公開のお題", "Past or upcoming official theme")
  }

  if (cell.hasAdoptedProposal) {
    return t(
      "この日付は新しい提案を受け付けていません。",
      "This date is no longer accepting new proposals.",
    )
  }

  if (cell.isSelectable && cell.hasProposals) {
    return t(
      `${cell.proposalsForDay.length}件の提案が集まっています。`,
      `${cell.proposalsForDay.length} proposals already exist for this date.`,
    )
  }

  if (cell.isSelectable) {
    return t(
      "カード全体をタップするとこの日付を選択できます。",
      "Tap the card to select this date.",
    )
  }

  return t(
    "この期間は既存お題の確認用です。",
    "This period is for checking official themes.",
  )
}

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
