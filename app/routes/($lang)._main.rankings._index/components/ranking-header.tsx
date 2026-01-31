import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "@remix-run/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  ImageIcon,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { useTranslation } from "~/hooks/use-translation"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { getWeeksInMonth, getWeekOfMonth } from "~/utils/get-weeks-in-month"

type Props = {
  year: number
  month: number
  day: number | null
  weekIndex: number | null
  rankingType?: "works" | "users"
  onRankingTypeChange?: (type: "works" | "users") => void
}

export function RankingHeader (props: Props) {
  const t = useTranslation()

  const year = props.year
  const month = props.month
  const day = props.day
  const weekIndex = props.weekIndex ?? 1

  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : props.weekIndex ? "ウィークリー" : "マンスリー")

  const [date, setDate] = useState("")

  const navigate = useNavigate()
  const location = useLocation()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
    const selectedDate = new Date(e.target.value)
    const newYear = selectedDate.getFullYear()
    const newMonth = selectedDate.getMonth() + 1
    const newDay = selectedDate.getDate()

    if (viewType === "ウィークリー") {
      const weekNumber = getWeekOfMonth(newYear, newMonth, newDay)
      navigateWithParams(`/rankings/${newYear}/${newMonth}/weeks/${weekNumber}`)
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
      navigateWithParams(`/rankings/${year}/${month}/weeks/1`)
    } else if (view === "デイリー") {
      const today = new Date()
      const previousDay = new Date(today)
      previousDay.setDate(today.getDate() - 1)
      navigateWithParams(
        `/rankings/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`,
      )
    } else {
      navigateWithParams(`/rankings/${year}/${month}`)
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
        ? `/rankings/${newYear}/${newMonth}/${actualDay}`
        : viewType === "ウィークリー"
          ? `/rankings/${newYear}/${newMonth}/weeks/${weekIndex}`
          : `/rankings/${newYear}/${newMonth}`

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
        `/rankings/${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}`,
      )
    }

    if (viewType === "マンスリー") {
      const newMonth = month === 1 ? 12 : month - 1
      const newYear = month === 1 ? year - 1 : year
      navigateWithParams(`/rankings/${newYear}/${newMonth}`)
    }

    if (viewType === "ウィークリー") {
      if (weekIndex > 1) {
        const newWeekIndex = weekIndex - 1
        navigateWithParams(`/rankings/${year}/${month}/weeks/${newWeekIndex}`)
      } else {
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        const prevMonthTotalWeeks = getWeeksInMonth(prevYear, prevMonth)
        navigateWithParams(
          `/rankings/${prevYear}/${prevMonth}/weeks/${prevMonthTotalWeeks}`,
        )
      }
    }
  }

  const handleNext = () => {
    if (viewType === "デイリー" && day) {
      const newDate = new Date(year, month - 1, day + 1)
      navigateWithParams(
        `/rankings/${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}`,
      )
    }

    if (viewType === "マンスリー") {
      const newMonth = month === 12 ? 1 : month + 1
      const newYear = month === 12 ? year + 1 : year
      navigateWithParams(`/rankings/${newYear}/${newMonth}`)
    }

    if (viewType === "ウィークリー") {
      const totalWeeksInMonth = getWeeksInMonth(year, month)

      if (weekIndex < totalWeeksInMonth) {
        const newWeekIndex = weekIndex + 1
        navigateWithParams(`/rankings/${year}/${month}/weeks/${newWeekIndex}`)
      } else {
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        navigateWithParams(`/rankings/${nextYear}/${nextMonth}/weeks/1`)
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
        const basePath = `/rankings/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
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
      for (let index = 5; index >= 0; index--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - index)
        const formattedMonth = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
        const basePath = `/rankings/${date.getFullYear()}/${date.getMonth() + 1}`
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
        const basePath = `/rankings/${year}/${month}/weeks/${weekNumber}`
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
    <div className="mx-auto w-full max-w-6xl space-y-8 rounded-3xl border border-border/30 bg-gradient-to-br from-background/80 to-muted/10 p-8 backdrop-blur-md">
      {/* ランキングタイプ切り替え */}
      {props.day !== null && props.onRankingTypeChange && (
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-2xl border border-border/50 bg-background/90 p-2 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => handleRankingTypeChange("works")}
              className={`flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-300 ${
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
              className={`flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-300 ${
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
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/90 to-pink-50/90 p-6 text-center backdrop-blur-sm dark:border-purple-800/50 dark:from-purple-900/30 dark:to-pink-900/30">
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
          className={`mx-auto mb-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${getViewTypeGradient()} p-4 text-white ring-4 ring-white/20`}
        >
          {getViewTypeIcon()}
          <span className="font-bold text-lg">
            {viewType === "マンスリー" &&
              t("マンスリーランキング", "Monthly Rankings")}
            {viewType === "デイリー" &&
              t("デイリーランキング", "Daily Rankings")}
            {viewType === "ウィークリー" &&
              t("ウィークリーランキング", "Weekly Rankings")}
          </span>
        </div>

        <h1 className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text font-bold text-4xl text-transparent">
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
        <div className="inline-flex items-center rounded-2xl border border-border/50 bg-background/90 p-2 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => handleViewChange("マンスリー")}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-300 ${
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
            className={`flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-300 ${
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
            className={`flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-300 ${
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
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        {/* 前へ・次へボタン */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            className="flex items-center gap-2 rounded-xl border-border/50 bg-background/80 px-6 py-3 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            {t("前へ", "Previous")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl border-border/50 bg-background/80 px-6 py-3 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            {t("次へ", "Next")}
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* 日付選択とコントロール */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/80 p-2 backdrop-blur-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="rounded-lg border-0 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <Button
            onClick={handleTodayClick}
            variant="outline"
            size="lg"
            className="rounded-xl border-border/50 bg-background/80 px-6 py-3 backdrop-blur-sm transition-all hover:bg-muted/50"
          >
            {t("最新", "Latest")}
          </Button>

          <div className="rounded-xl border border-border/50 bg-background/80 p-2 backdrop-blur-sm">
            <SensitiveToggle variant="compact" />
          </div>
        </div>
      </div>

      {/* カルーセル */}
      <div className="w-full">
        <Carousel
          className="relative overflow-hidden rounded-2xl"
          opts={{ dragFree: true, loop: false, align: "center" }}
        >
          <CarouselContent className="gap-3 pl-6">
            {carouselItems.map((item, index) => (
              <CarouselItem key={item.link} className="basis-auto">
                <TagButton
                  key={index.toString()}
                  link={item.link}
                  name={item.name}
                  border={item.border}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-3 bg-background/95 backdrop-blur-sm hover:bg-background" />
          <CarouselNext className="absolute top-1/2 right-3 bg-background/95 backdrop-blur-sm hover:bg-background" />
        </Carousel>
      </div>
    </div>
  )
}
