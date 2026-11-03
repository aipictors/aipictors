import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client/index"
import { Link, useNavigate } from "~/lib/app/locale-router"
import {
  addDays,
  addMonths,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { ja } from "date-fns/locale"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  Loader2Icon,
  PlusIcon,
  SendIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
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

type DayState = "official" | "open" | "proposed" | "adopted" | "closed"

type CalendarDay = {
  day: number
  dateText: string
  theme?: DailyTheme
  proposals: CalendarThemeProposal[]
  state: DayState
  isSelectable: boolean
}

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

const MAX_THEME_LENGTH = 80

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
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(
    startOfMonth(minimumProposalDate),
  )
  const [focusedDate, setFocusedDate] = useState<string | null>(null)
  const [checkedTheme, setCheckedTheme] = useState<string | null>(null)
  const [hasPickedDate, setHasPickedDate] = useState(false)

  const [createThemeProposal, { loading }] = useMutation<MutationData>(
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
  const [runDuplicateCheck, duplicateCheck] =
    useLazyQuery<DuplicateCheckQueryData>(ThemeProposalDuplicateThemesQuery, {
      fetchPolicy: "no-cache",
    })

  const trimmedTheme = theme.trim()

  // 重複チェックは入力が止まったら自動で行う
  useEffect(() => {
    if (trimmedTheme.length < 2 || authContext.isNotLoggedIn) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      void runDuplicateCheck({ variables: { theme: trimmedTheme } }).then(
        () => {
          setCheckedTheme(trimmedTheme)
        },
      )
    }, 700)
    return () => window.clearTimeout(timeoutId)
  }, [trimmedTheme, authContext.isNotLoggedIn])

  const dailyThemes = calendarData?.dailyThemes ?? []
  const monthThemeProposals = proposalCalendarData?.themeProposals ?? []
  const isDuplicateResultFresh = checkedTheme === trimmedTheme
  const duplicateThemes = isDuplicateResultFresh
    ? (duplicateCheck.data?.themeProposalDuplicateThemes ?? [])
    : []

  const proposalsByDate = monthThemeProposals.reduce((map, proposal) => {
    const items = map.get(proposal.targetDate) ?? []
    items.push(proposal)
    map.set(proposal.targetDate, items)
    return map
  }, new Map<string, CalendarThemeProposal[]>())

  const cells = createCalendarCells(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
  )

  const calendarDays: Array<CalendarDay | null> = cells.map((day) => {
    if (day === null) {
      return null
    }
    const cellDate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    )
    const dateText = format(cellDate, "yyyy-MM-dd")
    const proposals = proposalsByDate.get(dateText) ?? []
    const isAdopted = proposals.some((item) => item.status === "ADOPTED")
    const isTooEarly = isBefore(cellDate, minimumProposalDate)
    const themeForDay = dailyThemes.find((item) => item.dateText === dateText)
    const state: DayState = isTooEarly
      ? themeForDay
        ? "official"
        : "closed"
      : isAdopted
        ? "adopted"
        : proposals.some((item) => item.status === "PENDING")
          ? "proposed"
          : "open"
    return {
      day,
      dateText,
      theme: themeForDay,
      proposals,
      state,
      isSelectable: !isTooEarly && !isAdopted,
    }
  })

  const selectableDays = calendarDays.filter(
    (item): item is CalendarDay => item !== null && item.isSelectable,
  )

  // まだ誰も提案していない日（すぐ選べるように上に出す）
  const openDays = selectableDays
    .filter((item) => item.state === "open")
    .slice(0, 6)

  const isMonthLoaded =
    calendarData !== undefined &&
    proposalCalendarData !== undefined &&
    !isCalendarLoading &&
    !isProposalCalendarLoading

  // 先の日まで採用が決まっていることが多いので、最初は空いている一番早い日を選んでおく
  // （この月に選べる日が無ければ次の月を見る。1年先までで止める）
  useEffect(() => {
    if (hasPickedDate || !isMonthLoaded) {
      return
    }
    const firstDay =
      selectableDays.find((item) => item.state === "open") ?? selectableDays[0]
    if (firstDay) {
      setDate(firstDay.dateText)
      setHasPickedDate(true)
      return
    }
    if (visibleMonth < addMonths(startOfMonth(today), 12)) {
      setVisibleMonth(addMonths(visibleMonth, 1))
    }
  }, [hasPickedDate, isMonthLoaded, visibleMonth])

  const selectedProposals = proposalsByDate.get(date) ?? []
  const selectedDateIsAdopted = selectedProposals.some(
    (item) => item.status === "ADOPTED",
  )
  const focusedDay =
    calendarDays.find((item) => item?.dateText === (focusedDate ?? date)) ??
    null

  const isFormDisabled = authContext.isNotLoggedIn || loading

  const canSubmit =
    !isFormDisabled &&
    hasPickedDate &&
    trimmedTheme.length > 0 &&
    !selectedDateIsAdopted

  const selectDate = (value: string) => {
    setDate(value)
    setFocusedDate(value)
    setHasPickedDate(true)
  }

  const onSubmit = async () => {
    if (!canSubmit) {
      return
    }

    try {
      await createThemeProposal({
        variables: {
          date: date,
          theme: trimmedTheme,
          allowOtherDate: allowOtherDate,
          note: note.trim().length > 0 ? note.trim() : undefined,
        },
      })
      toast(
        t(
          "提案を送りました！",
          "Proposal sent!",
        ),
      )
      navigate("/themes/proposals/mine")
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : t("送信できませんでした", "Could not submit"),
      )
    }
  }

  const dateLabel = format(parseISO(date), "M月d日（EEE）", { locale: ja })

  const submitPanel = (
    <div className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={PICTOR_CHAN_ICON_URL} alt="" />
          <AvatarFallback>ぴ</AvatarFallback>
        </Avatar>
        <p className="min-w-0 rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
          {trimmedTheme.length > 0
            ? t(
                `${dateLabel}のお題に「${trimmedTheme}」だね！`,
                `"${trimmedTheme}" for ${date}, got it!`,
              )
            : t(
                "どんなお題にする？上で入力してね",
                "What theme would you like? Type it above",
              )}
        </p>
      </div>
      {authContext.isNotLoggedIn ? (
        <LoginDialogButton
          label={t("ログインして提案する", "Sign in to propose")}
          isWidthFull={true}
        />
      ) : (
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="h-12 w-full rounded-full bg-linear-to-r from-orange-500 to-rose-500 font-bold text-base text-white shadow-md hover:opacity-95"
        >
          {loading ? (
            <Loader2Icon className="mr-2 size-5 animate-spin" />
          ) : (
            <SendIcon className="mr-2 size-5" />
          )}
          {loading
            ? t("送信中", "Submitting")
            : t("この内容で提案する", "Submit proposal")}
        </Button>
      )}
      <p className="text-center text-muted-foreground text-xs">
        {t(
          "同じ月のお題は1人5件まで提案できます。",
          "Up to 5 proposals per person per month.",
        )}
      </p>
    </div>
  )

  return (
    <div className="space-y-5 pb-16">
      <div className="space-y-3">
        <Link
          to="/themes/proposals"
          className="inline-flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("みんなの提案", "All proposals")}
        </Link>
        <div>
          <h1 className="font-black text-2xl md:text-3xl">
            {t("お題を提案する", "Propose a theme")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "8日後以降のお題を提案できます。採用されると、お題ページにあなたの名前が載ります。",
              "Propose a theme from 8 days ahead. If adopted, your name appears on the theme page.",
            )}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <StepCard step={1} title={t("どんなお題？", "What's the theme?")}>
            <Input
              id="proposal-theme"
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value.slice(0, MAX_THEME_LENGTH))
              }
              disabled={isFormDisabled}
              placeholder={t("例: 雨上がりの商店街", "e.g. Rainy shopping street")}
              aria-label={t("お題", "Theme")}
              className="h-14 rounded-2xl text-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <DuplicateStatus
                theme={trimmedTheme}
                isChecking={
                  duplicateCheck.loading ||
                  (trimmedTheme.length >= 2 && !isDuplicateResultFresh)
                }
                isChecked={isDuplicateResultFresh}
                error={duplicateCheck.error?.message ?? null}
                duplicates={duplicateThemes}
                isLoggedOut={authContext.isNotLoggedIn}
              />
              <span className="ml-auto text-muted-foreground">
                {theme.length}/{MAX_THEME_LENGTH}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {t(
                "日本語でも英語でもOK。送信後にタイトルを整えて翻訳します。",
                "Japanese or English is fine. We tidy and translate the title after you submit.",
              )}
            </p>
          </StepCard>

          <StepCard step={2} title={t("いつのお題？", "Which day?")}>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-orange-50 to-rose-50 px-4 py-3 dark:from-orange-950/30 dark:to-rose-950/30">
              <div>
                <p className="text-muted-foreground text-xs">
                  {t("選んでいる日", "Selected date")}
                </p>
                {hasPickedDate ? (
                  <p className="font-bold text-xl">{dateLabel}</p>
                ) : (
                  <p className="flex items-center gap-2 py-1 text-muted-foreground text-sm">
                    <Loader2Icon className="size-4 animate-spin" />
                    {t("空いている日を探しています", "Finding an open day")}
                  </p>
                )}
              </div>
              {selectedProposals.length > 0 && !selectedDateIsAdopted && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 text-xs dark:bg-amber-950 dark:text-amber-200">
                  {t(
                    `ほかに${selectedProposals.length}件の提案`,
                    `${selectedProposals.length} other proposals`,
                  )}
                </span>
              )}
            </div>
            {hasPickedDate && selectedDateIsAdopted && (
              <p className="flex items-center gap-1.5 text-destructive text-sm">
                <AlertTriangleIcon className="size-4" />
                {t(
                  "この日はもうお題が決まっています。別の日を選んでください。",
                  "This day already has a theme. Please pick another day.",
                )}
              </p>
            )}
            {openDays.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs">
                  {t("まだ提案がない日", "Days with no proposals yet")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {openDays.map((item) => (
                    <button
                      key={item.dateText}
                      type="button"
                      onClick={() => selectDate(item.dateText)}
                      aria-pressed={item.dateText === date}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition",
                        item.dateText === date
                          ? "border-orange-500 bg-orange-500 font-semibold text-white"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
                      )}
                    >
                      {format(parseISO(item.dateText), "M/d (EEE)", {
                        locale: ja,
                      })}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              {t(
                "カレンダーからも選べます。",
                "You can also pick from the calendar.",
              )}
            </p>
            <label
              htmlFor="proposal-allow-other-date"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3"
            >
              <span>
                <span className="block font-medium text-sm">
                  {t("ほかの日でもOK", "Other days are OK too")}
                </span>
                <span className="block text-muted-foreground text-xs">
                  {t(
                    "この日に選ばれなくても、空いている別の日の候補にします",
                    "If not picked for this day, it can be used on another open day",
                  )}
                </span>
              </span>
              <Switch
                id="proposal-allow-other-date"
                checked={allowOtherDate}
                onCheckedChange={setAllowOtherDate}
                disabled={isFormDisabled}
              />
            </label>
          </StepCard>

          <StepCard
            step={3}
            title={t("ひとこと", "Add a note")}
            optionalLabel={t("任意", "Optional")}
          >
            {isNoteOpen || note.length > 0 ? (
              <>
                <Textarea
                  id="proposal-note"
                  placeholder={t(
                    "例: 秋っぽい雰囲気で。人物なしでも参加しやすいと思います",
                    "e.g. Autumn mood. Easy to join even without characters",
                  )}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={isFormDisabled}
                  rows={3}
                  maxLength={500}
                  aria-label={t("ひとこと", "Note")}
                  className="rounded-2xl"
                />
                <p className="text-muted-foreground text-xs">
                  {t(
                    "込めた思いや、描くときのヒントを書けます。お題ページにも表示されます。",
                    "Share the idea behind it or hints for creators. It is shown on the theme page.",
                  )}
                </p>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl border-dashed"
                onClick={() => setIsNoteOpen(true)}
                disabled={isFormDisabled}
              >
                <PlusIcon className="mr-1 size-4" />
                {t("意図やヒントを書く", "Add intent or hints")}
              </Button>
            )}
          </StepCard>

          <div className="hidden lg:block">{submitPanel}</div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={t("前の月", "Previous month")}
                onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              >
                <ChevronLeftIcon className="size-5" />
              </Button>
              <p className="flex items-center gap-2 font-bold text-lg">
                {t(
                  format(visibleMonth, "yyyy年M月"),
                  format(visibleMonth, "MMM yyyy"),
                )}
                {(isCalendarLoading || isProposalCalendarLoading) && (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                )}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={t("次の月", "Next month")}
                onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              >
                <ChevronRightIcon className="size-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground text-xs">
              <LegendDot className="bg-emerald-500" label={t("提案できる", "Open")} />
              <LegendDot
                className="bg-amber-400"
                label={t("提案あり", "Has proposals")}
              />
              <LegendDot className="bg-rose-500" label={t("決定", "Decided")} />
              <LegendDot
                className="bg-zinc-300 dark:bg-zinc-600"
                label={t("公開中・受付前", "Published / closed")}
              />
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[
                t("日", "S"),
                t("月", "M"),
                t("火", "T"),
                t("水", "W"),
                t("木", "T"),
                t("金", "F"),
                t("土", "S"),
              ].map((label, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: 曜日の見出し
                  key={index}
                  className={cn("pb-1 text-center font-semibold text-xs", {
                    "text-rose-500": index === 0,
                    "text-sky-500": index === 6,
                    "text-muted-foreground": index !== 0 && index !== 6,
                  })}
                >
                  {label}
                </div>
              ))}
              {calendarDays.map((item, index) => {
                if (item === null) {
                  // biome-ignore lint/suspicious/noArrayIndexKey: 空のマス
                  return <div key={`empty-${index}`} />
                }
                const isSelected = item.dateText === date
                const isFocused = item.dateText === focusedDay?.dateText
                const pendingCount = item.proposals.filter(
                  (proposal) => proposal.status === "PENDING",
                ).length
                return (
                  <button
                    key={item.dateText}
                    type="button"
                    onClick={() => {
                      if (item.isSelectable) {
                        selectDate(item.dateText)
                      } else {
                        setFocusedDate(item.dateText)
                      }
                    }}
                    aria-pressed={isSelected}
                    aria-label={format(parseISO(item.dateText), "M月d日", {
                      locale: ja,
                    })}
                    className={cn(
                      "relative flex h-14 flex-col items-center justify-start gap-0.5 overflow-hidden rounded-xl border p-1 text-left transition md:h-20 md:items-stretch md:p-1.5",
                      getDayClassName(item.state),
                      isSelected &&
                        "border-orange-500 bg-orange-500 text-white ring-2 ring-orange-300 hover:bg-orange-500 dark:ring-orange-700",
                      !isSelected &&
                        isFocused &&
                        "ring-2 ring-foreground/20",
                    )}
                  >
                    <span className="flex w-full items-center justify-center gap-1 md:justify-between">
                      <span className="font-bold text-sm">{item.day}</span>
                      <span
                        className={cn(
                          "size-1.5 rounded-full md:size-2",
                          isSelected ? "bg-white" : getDotClassName(item.state),
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "hidden w-full text-[10px] leading-tight md:line-clamp-2",
                        isSelected ? "text-white/90" : "text-muted-foreground",
                      )}
                    >
                      {item.state === "official" && item.theme
                        ? item.theme.title
                        : item.state === "adopted"
                          ? (item.proposals.find(
                              (proposal) => proposal.status === "ADOPTED",
                            )?.inputTheme ?? "")
                          : pendingCount > 0
                            ? t(`${pendingCount}件`, `${pendingCount}`)
                            : ""}
                    </span>
                    {pendingCount > 0 && (
                      <span
                        className={cn(
                          "text-[10px] leading-none md:hidden",
                          isSelected ? "text-white" : "text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {focusedDay && (
              <DayDetail
                day={focusedDay}
                isSelected={focusedDay.dateText === date}
                onSelect={() => selectDate(focusedDay.dateText)}
              />
            )}
          </section>
        </div>

        <div className="lg:hidden">{submitPanel}</div>
      </div>
    </div>
  )
}

function StepCard(props: {
  step: number
  title: string
  optionalLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-5">
      <h2 className="flex items-center gap-2 font-bold text-base">
        <span className="flex size-7 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-rose-500 font-black text-sm text-white">
          {props.step}
        </span>
        {props.title}
        {props.optionalLabel && (
          <span className="font-normal text-muted-foreground text-xs">
            {props.optionalLabel}
          </span>
        )}
      </h2>
      {props.children}
    </section>
  )
}

function DuplicateStatus(props: {
  theme: string
  isChecking: boolean
  isChecked: boolean
  error: string | null
  duplicates: DailyTheme[]
  isLoggedOut: boolean
}) {
  const t = useTranslation()

  if (props.theme.length < 2 || props.isLoggedOut) {
    return null
  }

  if (props.error) {
    return <span className="text-destructive">{props.error}</span>
  }

  if (props.isChecking || !props.isChecked) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        {t("過去のお題と比べています", "Checking past themes")}
      </span>
    )
  }

  if (props.duplicates.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2Icon className="size-3.5" />
        {t(
          "この1年で同じお題はありません",
          "No identical theme in the past year",
        )}
      </span>
    )
  }

  return (
    <div className="w-full space-y-1.5 rounded-2xl bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="flex items-center gap-1 font-medium">
        <AlertTriangleIcon className="size-3.5" />
        {t(
          `この1年で${props.duplicates.length}回出ています（このままでも送れます）`,
          `Used ${props.duplicates.length} times in the past year (you can still submit)`,
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {props.duplicates.map((item) => (
          <Link
            key={item.id}
            to={`/themes/${item.year}/${item.month}/${item.day}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/80 px-2.5 py-0.5 hover:underline dark:bg-zinc-900/60"
          >
            {format(parseISO(item.dateText), "yyyy/M/d")}「{item.title}」
          </Link>
        ))}
      </div>
    </div>
  )
}

function DayDetail(props: {
  day: CalendarDay
  isSelected: boolean
  onSelect(): void
}) {
  const t = useTranslation()

  const day = props.day

  const visibleProposals = day.proposals.filter(
    (item) => item.status !== "CANCELED",
  )

  return (
    <div className="space-y-2 rounded-2xl bg-muted/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">
          {format(parseISO(day.dateText), "M月d日（EEE）", { locale: ja })}
        </p>
        {day.isSelectable && !props.isSelected && (
          <Button size="sm" className="h-8 rounded-full" onClick={props.onSelect}>
            {t("この日にする", "Pick this day")}
          </Button>
        )}
        {props.isSelected && (
          <span className="rounded-full bg-orange-500 px-2.5 py-0.5 font-semibold text-white text-xs">
            {t("選択中", "Selected")}
          </span>
        )}
      </div>

      {day.state === "official" && day.theme && (
        <Link
          to={`/themes/${day.theme.year}/${day.theme.month}/${day.theme.day}`}
          className="block text-sm hover:underline"
        >
          {t("お題", "Theme")}: <span className="font-semibold">「{day.theme.title}」</span>
        </Link>
      )}

      {day.state === "closed" && (
        <p className="text-muted-foreground text-sm">
          {t(
            "この日はもう提案を受け付けていません（8日後から提案できます）",
            "Proposals for this day are closed (open from 8 days ahead)",
          )}
        </p>
      )}

      {day.state === "open" && (
        <p className="text-emerald-700 text-sm dark:text-emerald-300">
          {t(
            "まだ誰も提案していません。チャンス！",
            "No one has proposed yet. Your chance!",
          )}
        </p>
      )}

      {visibleProposals.length > 0 && (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto">
          {visibleProposals.map((proposal) => (
            <li
              key={proposal.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-background px-3 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  「{proposal.inputTheme}」
                </span>
                <span className="block truncate text-muted-foreground text-xs">
                  {proposal.proposerName}
                  {proposal.status === "ADOPTED" &&
                    ` ・ ${t("採用", "Adopted")}`}
                  {proposal.status === "REJECTED" &&
                    ` ・ ${t("見送り", "Not selected")}`}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-0.5 text-muted-foreground text-xs">
                <HeartIcon className="size-3.5" />
                {proposal.likesCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LegendDot(props: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("size-2 rounded-full", props.className)} />
      {props.label}
    </span>
  )
}

function getDayClassName(state: DayState) {
  switch (state) {
    case "open":
      return "border-emerald-200 bg-emerald-50/70 hover:border-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/30"
    case "proposed":
      return "border-amber-200 bg-amber-50/70 hover:border-amber-400 dark:border-amber-900 dark:bg-amber-950/30"
    case "adopted":
      return "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30"
    default:
      return "border-transparent bg-muted/40 text-muted-foreground"
  }
}

function getDotClassName(state: DayState) {
  switch (state) {
    case "open":
      return "bg-emerald-500"
    case "proposed":
      return "bg-amber-400"
    case "adopted":
      return "bg-rose-500"
    default:
      return "bg-zinc-300 dark:bg-zinc-600"
  }
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

