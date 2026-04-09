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
    precheckComment?: string | null
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
  const [runDuplicateCheck, duplicateCheck] = useLazyQuery<DuplicateCheckQueryData>(
    ThemeProposalDuplicateThemesQuery,
    {
      fetchPolicy: "no-cache",
    },
  )

  const dailyThemes = calendarData?.dailyThemes ?? []
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

    toast(
      result.data?.createThemeProposal.precheckComment ||
        t("提案を送信しました", "Submitted the proposal"),
    )
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
        <Card className="border-orange-200 bg-linear-to-br from-orange-50 via-background to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4" />
              {t("提案内容", "Proposal")}
            </CardTitle>
            <CardDescription>
              {t(
                "英語でも日本語でも送信できます。送信時に一次チェックと翻訳整形を行います。",
                "You can submit in Japanese or English. A pre-check and translation normalization will run on submit.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-orange-200 bg-white/80 p-4 shadow-sm">
              <p className="text-muted-foreground text-xs">
                {t("選択中の対象日", "Selected target date")}
              </p>
              <div className="mt-2 flex items-center gap-2 overflow-hidden">
                <CalendarDaysIcon className="size-4 text-orange-500" />
                <p className="truncate whitespace-nowrap font-semibold text-lg">
                  {format(parseISO(date), "yyyy/MM/dd (EEE)", { locale: ja })}
                </p>
              </div>
              <p className="mt-2 whitespace-nowrap text-muted-foreground text-xs">
                {t(
                  `提案できる最短日は ${format(minimumProposalDate, "yyyy/MM/dd")} です。`,
                  `The earliest proposal date is ${format(minimumProposalDate, "yyyy/MM/dd")}.`,
                )}
              </p>
            </div>

            <Alert>
              <AlertDescription>
                {t(
                  "提案一覧ではログインユーザーが保留中の案にいいねできます。採用判定ではAIが内容に加えていいね数も参考にし、近い案ならいいねの多い案を優先します。",
                  "Signed-in users can like pending proposals in the list. Adoption AI now considers likes too, and will prefer higher-liked proposals when candidates are otherwise close.",
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

            <div className="rounded-3xl border bg-background/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {t("過去の重複チェック", "Duplicate history check")}
                  </p>
                  <p className="text-muted-foreground text-xs">
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
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm">
                      {t(
                        "直近1年では同じお題は見つかりませんでした。",
                        "No matching theme was found in the past year.",
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border bg-white p-3">
                      <p className="font-medium text-sm">
                        {t("一致した開催日", "Matching dates")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {duplicateThemes.map((item) => (
                          <Link
                            key={item.id}
                            to={`/themes/${item.year}/${item.month}/${item.day}`}
                            className="max-w-full truncate whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm transition hover:bg-orange-100"
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
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-muted-foreground text-sm">
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

        <Card className="overflow-hidden border-sky-200 bg-linear-to-br from-sky-50 via-background to-cyan-50">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{t("お題カレンダー", "Theme calendar")}</CardTitle>
                <CardDescription>
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
                <div className="min-w-28 whitespace-nowrap text-center font-semibold text-sm">
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
              <Badge className="whitespace-nowrap bg-emerald-600 text-white">{t("提案OK", "Proposal open")}</Badge>
              <Badge className="whitespace-nowrap bg-slate-500 text-white">{t("受付前", "Not open yet")}</Badge>
            </div>

            {isCalendarLoading && dailyThemes.length === 0 ? (
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
                      return <div key={`empty-${index}`} className="aspect-square rounded-3xl bg-white/20" />
                    }

                    const cellDate = new Date(
                      visibleMonth.getFullYear(),
                      visibleMonth.getMonth(),
                      day,
                    )
                    const dateText = format(cellDate, "yyyy-MM-dd")
                    const themeForDay = dailyThemes.find((item) => item.dateText === dateText)
                    const isSelectable = !isBefore(cellDate, minimumProposalDate)
                    const isSelected = dateText === date
                    const isHistoryWindow = isBefore(cellDate, minimumProposalDate)

                    return (
                      <button
                        key={dateText}
                        type="button"
                        onClick={() => {
                          if (isSelectable) {
                            onSelectDate(dateText)
                          }
                        }}
                        className={cn(
                          "relative aspect-square rounded-3xl border p-2 text-left transition",
                          {
                            "cursor-pointer border-emerald-500 bg-emerald-50 shadow-sm": isSelectable,
                            "cursor-default border-slate-200 bg-white/80": !isSelectable,
                            "ring-2 ring-orange-400": isSelected,
                          },
                        )}
                      >
                        <div className="flex items-start justify-between gap-1 overflow-hidden">
                          <span className="font-semibold text-sm">{day}</span>
                          {isSelectable ? (
                            <Badge className="h-5 whitespace-nowrap bg-emerald-600 px-1.5 text-[10px] text-white">
                              {t("提案OK", "Open")}
                            </Badge>
                          ) : (
                            <Badge className="h-5 whitespace-nowrap bg-slate-500 px-1.5 text-[10px] text-white">
                              {isHistoryWindow
                                ? t("公開中", "Visible")
                                : t("受付前", "Closed")}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 text-[11px] leading-4">
                          {themeForDay && isHistoryWindow ? (
                            <>
                              <p className="truncate whitespace-nowrap font-medium" title={themeForDay.title}>{themeForDay.title}</p>
                              <p className="mt-1 truncate whitespace-nowrap text-muted-foreground text-[10px]">
                                {t("過去または近日公開のお題", "Past or upcoming official theme")}
                              </p>
                            </>
                          ) : isSelectable ? (
                            <p className="truncate whitespace-nowrap text-emerald-700 text-xs">
                              {t("この日付に提案できます", "You can propose for this date")}
                            </p>
                          ) : (
                            <p className="truncate whitespace-nowrap text-muted-foreground text-xs">
                              {t("この期間は既存お題の確認用です", "This period is for checking official themes")}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DuplicateSummaryCard(props: { label: string, count: number }) {
  return (
    <div className="rounded-2xl border bg-white p-3 text-center shadow-sm">
      <p className="text-muted-foreground text-xs">{props.label}</p>
      <p className="mt-1 font-semibold text-2xl">{props.count}</p>
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

const CreateThemeProposalMutation = gql`
  mutation CreateThemeProposal($date: String!, $theme: String!) {
    createThemeProposal(date: $date, theme: $theme) {
      id
      title
      targetDate
      precheckComment
    }
  }
`
