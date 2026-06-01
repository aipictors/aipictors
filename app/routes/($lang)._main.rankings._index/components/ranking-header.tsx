import { Link, useLocation, useNavigate } from "@remix-run/react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
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

  useEffect(() => {
    setDate(buildDateInputValue(year, month, viewType === "デイリー" ? day : 1))
  }, [year, month, day, viewType])

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
    <div className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-border/30 bg-gradient-to-br from-background/80 to-muted/10 p-4 backdrop-blur-md sm:p-6 lg:space-y-8 lg:p-8">
      <div className="flex justify-center">
        <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-border/50 bg-background/90 p-2 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate(defaultRankingsPath)}
            className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all duration-300 sm:gap-3 sm:px-6 ${
              !isAiRankingPage
                ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white ring-2 ring-slate-200 ring-offset-2 dark:from-slate-200 dark:to-slate-400 dark:text-slate-950"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            disabled={!isAiRankingPage}
          >
            <ImageIcon className="h-5 w-5" />
            {t("通常ランキング", "Standard Rankings")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate(aiRankingsPath)}
            className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all duration-300 sm:gap-3 sm:px-6 ${
              isAiRankingPage
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-2 ring-amber-200 ring-offset-2"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            disabled={isAiRankingPage}
          >
            <TrendingUpIcon className="h-5 w-5" />
            {t("AIランキング", "AI Rankings")}
          </Button>
        </div>
      </div>

      {/* ランキングタイプ切り替え */}
      {props.day !== null && props.onRankingTypeChange && (
        <div className="flex justify-center">
          <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-border/50 bg-background/90 p-2 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none]">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleRankingTypeChange("works")}
              className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all duration-300 sm:gap-3 sm:px-6 ${
                props.rankingType === "works"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ring-2 ring-blue-200 ring-offset-2"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              {t("作品ランキング", "Work Rankings")}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleRankingTypeChange("users")}
              className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all duration-300 sm:gap-3 sm:px-6 ${
                props.rankingType === "users"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white ring-2 ring-purple-200 ring-offset-2"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <UsersIcon className="h-5 w-5" />
              {t("ユーザランキング", "User Rankings")}
            </Button>
          </div>
        </div>
      )}

      {/* ユーザーランキングの説明 */}
      {props.day !== null && props.rankingType === "users" && (
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/90 to-pink-50/90 p-4 text-center backdrop-blur-sm sm:p-6 dark:border-purple-800/50 dark:from-purple-900/30 dark:to-pink-900/30">
          <div className="mb-2 text-2xl">🏆</div>
          <p className="font-semibold text-purple-700 dark:text-purple-300">
            {t("最高いいね数でランキング", "Ranked by Highest Likes")}
          </p>
          <p className="mt-2 text-purple-600 text-sm dark:text-purple-400">
            {t(
              "期間中の投稿作品で最もいいね数の多い作品で順位付けされています",
              "Ranked by the work with the highest likes in the period",
            )}
          </p>
        </div>
      )}

      {/* タイトルセクション */}
      <div className="text-center">
        <div
          className={`mx-auto mb-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${getViewTypeGradient()} px-4 py-3 text-white ring-4 ring-white/20`}
        >
          {getViewTypeIcon()}
          <span className="font-bold text-base sm:text-lg">
            {viewType === "マンスリー" &&
              t("マンスリーランキング", "Monthly Rankings")}
            {viewType === "デイリー" &&
              t("デイリーランキング", "Daily Rankings")}
            {viewType === "ウィークリー" &&
              t("ウィークリーランキング", "Weekly Rankings")}
          </span>
        </div>

        <h1 className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text font-bold text-2xl text-transparent sm:text-3xl lg:text-4xl">
          {year}年{month.toString().padStart(2, "0")}月
          {day
            ? `${day.toString().padStart(2, "0")}日`
            : weekIndex && viewType !== "マンスリー"
              ? ` 第${weekIndex}週`
              : ""}
        </h1>
      </div>

      {/* 期間選択ボタン */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-border/50 bg-background/90 p-2 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleViewChange("マンスリー")}
            className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-300 sm:px-6 ${
              viewType === "マンスリー"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white ring-2 ring-orange-200 ring-offset-2"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            disabled={viewType === "マンスリー"}
          >
            <CalendarIcon className="h-4 w-4" />
            {t("月間", "Monthly")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleViewChange("デイリー")}
            className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-300 sm:px-6 ${
              viewType === "デイリー"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-2 ring-emerald-200 ring-offset-2"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            disabled={viewType === "デイリー"}
          >
            <TrendingUpIcon className="h-4 w-4" />
            {t("日間", "Daily")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleViewChange("ウィークリー")}
            className={`shrink-0 whitespace-nowrap flex h-auto items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-300 sm:px-6 ${
              viewType === "ウィークリー"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ring-2 ring-blue-200 ring-offset-2"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            disabled={viewType === "ウィークリー"}
          >
            <ImageIcon className="h-4 w-4" />
            {t("週間", "Weekly")}
          </Button>
        </div>
      </div>

      {/* ナビゲーションとコントロール */}
      <div className="grid gap-3 rounded-2xl border border-border/40 bg-background/65 p-3 backdrop-blur-sm lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            className="flex h-11 items-center gap-2 rounded-xl border-border/50 bg-background/80 px-4 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            {t("前へ", "Previous")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border-border/50 bg-background/80 px-4 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            {t("次へ", "Next")}
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:justify-self-end">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border/50 bg-background/80 px-3 backdrop-blur-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              aria-label={t("ランキング日付", "Ranking date")}
              className="w-full rounded-lg border-0 bg-transparent px-1 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Button
            onClick={handleTodayClick}
            variant="outline"
            size="lg"
            className="h-11 rounded-xl border-border/50 bg-background/80 px-5 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            {t("最新", "Latest")}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/60 px-3 py-3 backdrop-blur-sm">
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
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
      </div>
    </div>
  )
}
