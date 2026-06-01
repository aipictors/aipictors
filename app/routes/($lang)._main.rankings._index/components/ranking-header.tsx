import { Link, useLocation, useNavigate } from "@remix-run/react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  LayoutGridIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getWeekOfMonth, getWeeksInMonth } from "~/utils/get-weeks-in-month"

type Props = {
  year: number
  month: number
  day: number | null
  weekIndex: number | null
  rankingType?: "works" | "users"
  onRankingTypeChange?: (type: "works" | "users") => void
  pathnamePrefix?: string
}

export function RankingHeader(props: Props) {
  const t = useTranslation()

  const year = props.year
  const month = props.month
  const day = props.day
  const weekIndex = props.weekIndex ?? 1
  const pathnamePrefix = props.pathnamePrefix ?? "/rankings"

  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : props.weekIndex ? "ウィークリー" : "マンスリー")

  const navigate = useNavigate()
  const location = useLocation()
  const isAiRankingPage = pathnamePrefix === "/ai-rankings"

  const buildDateInputValue = (
    targetYear: number,
    targetMonth: number,
    targetDay: number | null,
  ) => {
    return `${targetYear}-${targetMonth.toString().padStart(2, "0")}-${(targetDay ?? 1).toString().padStart(2, "0")}`
  }

  const [date, setDate] = useState(
    buildDateInputValue(year, month, props.day ?? 1),
  )
  const [isDateRailOpen, setIsDateRailOpen] = useState(false)

  useEffect(() => {
    setDate(buildDateInputValue(year, month, viewType === "デイリー" ? day : 1))
  }, [year, month, day, viewType])

  useEffect(() => {
    setIsDateRailOpen(false)
  }, [viewType, year, month, day, weekIndex])

  const buildRankingModePath = (basePathname: string) => {
    if (viewType === "デイリー" && day) {
      return `${basePathname}/${year}/${month}/${day}`
    }

    if (viewType === "ウィークリー") {
      return `${basePathname}/${year}/${month}/weeks/${weekIndex}`
    }

    return `${basePathname}/${year}/${month}`
  }

  const defaultRankingsPath = buildRankingModePath("/rankings")
  const aiRankingsPath = buildRankingModePath("/ai-rankings")

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
    const selectedDate = new Date(e.target.value)
    const newYear = selectedDate.getFullYear()
    const newMonth = selectedDate.getMonth() + 1
    const newDay = selectedDate.getDate()

    if (viewType === "ウィークリー") {
      const weekNumber = getWeekOfMonth(newYear, newMonth, newDay)
      navigateWithParams(
        `${pathnamePrefix}/${newYear}/${newMonth}/weeks/${weekNumber}`,
      )
    } else {
      handleNavigate(newYear, newMonth, newDay)
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    const previousDay = new Date(today)
    previousDay.setDate(today.getDate() - 1)
    const newYear = previousDay.getFullYear()
    const newMonth = previousDay.getMonth() + 1
    const newDay = previousDay.getDate()
    setDate(previousDay.toISOString().split("T")[0])
    setViewType("デイリー")
    handleNavigate(newYear, newMonth, newDay)
  }

  const navigateWithParams = (path: string) => {
    const currentSearchParams = new URLSearchParams(location.search)
    const searchString = currentSearchParams.toString()
    const fullPath = searchString ? `${path}?${searchString}` : path
    navigate(fullPath)
  }

  const handleViewChange = (
    view: "マンスリー" | "デイリー" | "ウィークリー",
  ) => {
    setViewType(view)
    if (view === "ウィークリー") {
      navigateWithParams(`${pathnamePrefix}/${year}/${month}/weeks/1`)
    } else if (view === "デイリー") {
      const today = new Date()
      const previousDay = new Date(today)
      previousDay.setDate(today.getDate() - 1)
      navigateWithParams(
        `${pathnamePrefix}/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`,
      )
    } else {
      navigateWithParams(`${pathnamePrefix}/${year}/${month}`)
    }
  }

  const handleNavigate = (
    newYear: number = year,
    newMonth: number = month,
    newDay: number | null = day,
  ) => {
    const actualDay = newDay === 0 || newDay == null ? 1 : newDay
    const newPath =
      viewType === "デイリー"
        ? `${pathnamePrefix}/${newYear}/${newMonth}/${actualDay}`
        : viewType === "ウィークリー"
          ? `${pathnamePrefix}/${newYear}/${newMonth}/weeks/${weekIndex}`
          : `${pathnamePrefix}/${newYear}/${newMonth}`

    const currentSearchParams = new URLSearchParams(location.search)
    const searchString = currentSearchParams.toString()
    const fullPath = searchString ? `${newPath}?${searchString}` : newPath

    if (location.pathname !== newPath) {
      navigate(fullPath)
    }
  }

  const handlePrevious = () => {
    if (viewType === "デイリー" && day) {
      const newDate = new Date(year, month - 1, day - 1)
      navigateWithParams(
        `${pathnamePrefix}/${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}`,
      )
    }

    if (viewType === "マンスリー") {
      const newMonth = month === 1 ? 12 : month - 1
      const newYear = month === 1 ? year - 1 : year
      navigateWithParams(`${pathnamePrefix}/${newYear}/${newMonth}`)
    }

    if (viewType === "ウィークリー") {
      if (weekIndex > 1) {
        const newWeekIndex = weekIndex - 1
        navigateWithParams(
          `${pathnamePrefix}/${year}/${month}/weeks/${newWeekIndex}`,
        )
      } else {
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        const prevMonthTotalWeeks = getWeeksInMonth(prevYear, prevMonth)
        navigateWithParams(
          `${pathnamePrefix}/${prevYear}/${prevMonth}/weeks/${prevMonthTotalWeeks}`,
        )
      }
    }
  }

  const handleNext = () => {
    if (viewType === "デイリー" && day) {
      const newDate = new Date(year, month - 1, day + 1)
      navigateWithParams(
        `${pathnamePrefix}/${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}`,
      )
    }

    if (viewType === "マンスリー") {
      const newMonth = month === 12 ? 1 : month + 1
      const newYear = month === 12 ? year + 1 : year
      navigateWithParams(`${pathnamePrefix}/${newYear}/${newMonth}`)
    }

    if (viewType === "ウィークリー") {
      const totalWeeksInMonth = getWeeksInMonth(year, month)

      if (weekIndex < totalWeeksInMonth) {
        const newWeekIndex = weekIndex + 1
        navigateWithParams(
          `${pathnamePrefix}/${year}/${month}/weeks/${newWeekIndex}`,
        )
      } else {
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        navigateWithParams(`${pathnamePrefix}/${nextYear}/${nextMonth}/weeks/1`)
      }
    }
  }

  const generateCarouselItems = () => {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const items: {
      link: string
      name: string
      border: boolean
      icon?: string
    }[] = []

    const currentSearchParams = new URLSearchParams(location.search)
    const searchString = currentSearchParams.toString()

    if (viewType === "デイリー") {
      for (let index = 0; index < 7; index++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (6 - index))
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`
        const basePath = `${pathnamePrefix}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath

        items.push({
          link: linkWithParams,
          name: formattedDate,
          border:
            `${props.year}/${props.month}/${props.day}` ===
            `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
        })
      }
    }

    if (viewType === "マンスリー") {
      // NOTE: setMonth() keeps the day-of-month; when today is 29-31 it can overflow
      // into the next month (e.g. Mar 31 -> Feb 31 -> Mar 2), causing duplicated months.
      const baseMonthDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const seenMonths = new Set<string>()
      // Exclude "this month" (0 months ago) because monthly rankings may not be published yet.
      for (let index = 6; index >= 1; index--) {
        const date = new Date(baseMonthDate)
        date.setMonth(baseMonthDate.getMonth() - index)
        const formattedMonth = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
        if (seenMonths.has(formattedMonth)) continue
        seenMonths.add(formattedMonth)
        const basePath = `${pathnamePrefix}/${date.getFullYear()}/${date.getMonth() + 1}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath

        items.push({
          link: linkWithParams,
          name: formattedMonth,
          border:
            formattedMonth === `${year}/${month.toString().padStart(2, "0")}`,
        })
      }
    }

    if (viewType === "ウィークリー") {
      const totalWeeksInMonth = getWeeksInMonth(year, month)

      for (let index = 0; index < totalWeeksInMonth; index++) {
        const weekNumber = index + 1
        const basePath = `${pathnamePrefix}/${year}/${month}/weeks/${weekNumber}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath

        items.push({
          link: linkWithParams,
          name: `第${weekNumber}週`,
          border: weekIndex === weekNumber,
        })
      }
    }

    return items
  }

  const carouselItems = generateCarouselItems()

  const getQuickSelectChipClassName = (isActive: boolean) =>
    cn(
      "snap-start whitespace-nowrap rounded-full border px-4 py-2.5 font-semibold text-sm transition-all duration-200",
      isActive
        ? `border-transparent bg-gradient-to-r ${getViewTypeGradient()} text-white shadow-md`
        : "border-border/50 bg-background/85 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
    )

  const handleRankingTypeChange = (type: "works" | "users") => {
    if (props.onRankingTypeChange) {
      props.onRankingTypeChange(type)
    }
  }

  const getViewTypeIcon = () => {
    switch (viewType) {
      case "マンスリー":
        return <CalendarIcon className="h-5 w-5" />
      case "デイリー":
        return <TrendingUpIcon className="h-5 w-5" />
      case "ウィークリー":
        return <ImageIcon className="h-5 w-5" />
    }
  }

  const getViewTypeGradient = () => {
    switch (viewType) {
      case "マンスリー":
        return "from-orange-500 to-red-500"
      case "デイリー":
        return "from-emerald-500 to-teal-500"
      case "ウィークリー":
        return "from-blue-500 to-indigo-500"
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-0">
      <div className="space-y-4 rounded-[28px] border border-border/40 bg-background/85 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs">
              <LayoutGridIcon className="h-3.5 w-3.5" />
              <span>ランキングを探す</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg sm:text-xl">
                {year}年{month.toString().padStart(2, "0")}月
                {day
                  ? `${day.toString().padStart(2, "0")}日`
                  : weekIndex && viewType !== "マンスリー"
                    ? ` 第${weekIndex}週`
                    : ""}
              </h2>
              <p className="text-muted-foreground text-sm">
                通常 / AI、作品 / ユーザー、日間 / 週間 / 月間をコンパクトに切り替えられます。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-1.5 font-semibold text-white ${getViewTypeGradient()}`}
            >
              {getViewTypeIcon()}
              <span>
                {viewType === "マンスリー" && t("月間", "Monthly")}
                {viewType === "デイリー" && t("日間", "Daily")}
                {viewType === "ウィークリー" && t("週間", "Weekly")}
              </span>
            </span>
            {props.day !== null && props.rankingType === "users" && (
              <span className="rounded-full bg-purple-100 px-3 py-1.5 font-medium text-purple-700 dark:bg-purple-950/60 dark:text-purple-200">
                最高いいね数で順位付け
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex min-w-0 items-center gap-1 rounded-full border border-border/50 bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(defaultRankingsPath)}
            className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              !isAiRankingPage
                ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-sm dark:from-slate-200 dark:to-slate-400 dark:text-slate-950"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            disabled={!isAiRankingPage}
          >
            <ImageIcon className="h-4 w-4" />
            {t("通常ランキング", "Standard Rankings")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(aiRankingsPath)}
            className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              isAiRankingPage
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            disabled={isAiRankingPage}
          >
            <TrendingUpIcon className="h-4 w-4" />
            {t("AIランキング", "AI Rankings")}
          </Button>
            </div>

            {props.day !== null && props.onRankingTypeChange && (
              <div className="flex min-w-0 items-center gap-1 rounded-full border border-border/50 bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRankingTypeChange("works")}
              className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
                props.rankingType === "works"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              {t("作品ランキング", "Work Rankings")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRankingTypeChange("users")}
              className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
                props.rankingType === "users"
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              <UsersIcon className="h-4 w-4" />
              {t("ユーザランキング", "User Rankings")}
            </Button>
              </div>
            )}

            <div className="flex min-w-0 items-center gap-1 rounded-full border border-border/50 bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("マンスリー")}
            className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              viewType === "マンスリー"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            disabled={viewType === "マンスリー"}
          >
            <CalendarIcon className="h-4 w-4" />
            {t("月間", "Monthly")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("デイリー")}
            className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              viewType === "デイリー"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            disabled={viewType === "デイリー"}
          >
            <TrendingUpIcon className="h-4 w-4" />
            {t("日間", "Daily")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewChange("ウィークリー")}
            className={`h-9 rounded-full px-3 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              viewType === "ウィークリー"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            disabled={viewType === "ウィークリー"}
          >
            <ImageIcon className="h-4 w-4" />
            {t("週間", "Weekly")}
          </Button>
            </div>
          </div>

          <div className="grid gap-2 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-9 rounded-full border-border/50 bg-background/80 px-3 text-xs backdrop-blur-sm hover:bg-muted/50 sm:px-4 sm:text-sm"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            {t("前へ", "Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-9 rounded-full border-border/50 bg-background/80 px-3 text-xs backdrop-blur-sm hover:bg-muted/50 sm:px-4 sm:text-sm"
          >
            {t("次へ", "Next")}
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
            </div>

            <div className="flex h-9 items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 backdrop-blur-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              aria-label={t("ランキング日付", "Ranking date")}
              className="w-full rounded-lg border-0 bg-transparent px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Button
            onClick={handleTodayClick}
            variant="outline"
            size="sm"
            className="h-9 justify-self-start rounded-full border-border/50 bg-background/80 px-4 text-xs backdrop-blur-sm hover:bg-muted/50 sm:text-sm lg:justify-self-end"
          >
            {t("最新", "Latest")}
          </Button>
        </div>

          <div className="rounded-2xl border border-border/40 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground text-sm">
                  {t("日付候補", "Recent periods")}
                </p>
                <p className="text-muted-foreground text-xs">
                  最近の候補一覧は必要なときだけ展開できます。
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDateRailOpen((value) => !value)}
                className="h-8 rounded-full px-3 text-xs"
              >
                {isDateRailOpen ? "閉じる" : "表示"}
              </Button>
            </div>

            {isDateRailOpen && (
              <div className="mt-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex min-w-max gap-2 pr-2 touch-pan-x snap-x snap-mandatory">
            {carouselItems.map((item) => (
              <Link
                key={item.link}
                to={item.link}
                className={getQuickSelectChipClassName(item.border)}
              >
                {item.name}
              </Link>
            ))}
          </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
