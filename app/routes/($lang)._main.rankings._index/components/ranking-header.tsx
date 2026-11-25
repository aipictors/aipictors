import { useLocation } from "@remix-run/react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CrownIcon,
  HeartHandshakeIcon,
  ImageIcon,
  SparklesIcon,
  SproutIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import {
  appFilterChipClassName,
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Button } from "~/components/ui/button"
import { useHideCoinSupport } from "~/hooks/use-hide-coin-support"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  getLatestPublishedWeeklyPeriod,
  getWeeklyRankingPeriod,
  getWeekOfMonth,
  getWeeksInMonth,
} from "~/utils/get-weeks-in-month"
import { toPopularWorksPath } from "~/utils/popular-works-date"

type Props = {
  /** 上の見どころがない日付別のページでは、この日付をページの見出し（h1）にする */
  isPageHeading?: boolean
  year: number
  month: number
  day: number | null
  weekIndex: number | null
  rankingType?: "works" | "users"
  onRankingTypeChange?: (type: "works" | "users") => void
  rankingFamily?: "standard" | "support"
  onRankingFamilyChange?: (family: "standard" | "support") => void
  pathnamePrefix?: string
  showRankingFamilyToggle?: boolean
  defaultPathnamePrefix?: string
  aiPathnamePrefix?: string
}

export function RankingHeader(props: Props) {
  const t = useTranslation()
  // 推しを表示しない設定の人には「推し・貢献度」の切り替えを出さない
  const isHideCoinSupport = useHideCoinSupport()

  const year = props.year
  const month = props.month
  const day = props.day
  const weekIndex = props.weekIndex ?? 1
  const pathnamePrefix = props.pathnamePrefix ?? "/rankings"
  const Heading = props.isPageHeading ? "h1" : "h2"
  const rankingFamily = props.rankingFamily ?? "standard"
  const showRankingFamilyToggle = props.showRankingFamilyToggle ?? true
  const defaultPathnamePrefix = props.defaultPathnamePrefix ?? "/rankings"
  const aiPathnamePrefix = props.aiPathnamePrefix ?? "/ai-rankings"

  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : props.weekIndex ? "ウィークリー" : "マンスリー")

  const navigate = useNavigate()
  const location = useLocation()
  const isAiRankingPage = pathnamePrefix === aiPathnamePrefix
  const isSensitiveRankingPage = pathnamePrefix.startsWith("/r/")

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

  const defaultRankingsPath = buildRankingModePath(defaultPathnamePrefix)
  const aiRankingsPath = buildRankingModePath(aiPathnamePrefix)

  const toSensitivePrefix = (basePathname: string) =>
    basePathname.startsWith("/r/") ? basePathname : `/r${basePathname}`

  const toAllAgesPrefix = (basePathname: string) =>
    basePathname.startsWith("/r/")
      ? basePathname.replace(/^\/r/, "")
      : basePathname

  const rankingAgeToggleBasePath = isSensitiveRankingPage
    ? isAiRankingPage
      ? toAllAgesPrefix(aiPathnamePrefix)
      : toAllAgesPrefix(defaultPathnamePrefix)
    : isAiRankingPage
      ? toSensitivePrefix(aiPathnamePrefix)
      : toSensitivePrefix(defaultPathnamePrefix)

  const rankingAgeTogglePath = (() => {
    const basePath = buildRankingModePath(rankingAgeToggleBasePath)
    return location.search ? `${basePath}${location.search}` : basePath
  })()

  const getLatestPathForView = (
    targetView: "マンスリー" | "デイリー" | "ウィークリー",
  ) => {
    const now = new Date()
    const previousDay = new Date(now)
    previousDay.setDate(now.getDate() - 1)

    if (targetView === "デイリー") {
      return `${pathnamePrefix}/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`
    }

    if (targetView === "マンスリー") {
      const latestMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return `${pathnamePrefix}/${latestMonthDate.getFullYear()}/${latestMonthDate.getMonth() + 1}`
    }

    const latestWeeklyPeriod = getLatestPublishedWeeklyPeriod(now)

    return `${pathnamePrefix}/${latestWeeklyPeriod.year}/${latestWeeklyPeriod.month}/weeks/${latestWeeklyPeriod.weekIndex}`
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
    const selectedDate = new Date(e.target.value)
    const newYear = selectedDate.getFullYear()
    const newMonth = selectedDate.getMonth() + 1
    const newDay = selectedDate.getDate()

    if (viewType === "ウィークリー") {
      const weeklyPeriod = getWeeklyRankingPeriod(newYear, newMonth, newDay)
      navigateWithParams(
        `${pathnamePrefix}/${weeklyPeriod.year}/${weeklyPeriod.month}/weeks/${weeklyPeriod.weekIndex}`,
      )
    } else {
      handleNavigate(newYear, newMonth, newDay)
    }
  }

  const handleTodayClick = () => {
    const latestPath = getLatestPathForView(viewType)
    navigateWithParams(latestPath)
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
      const weeklyPeriod = getWeeklyRankingPeriod(year, month, day ?? 1)
      navigateWithParams(
        `${pathnamePrefix}/${weeklyPeriod.year}/${weeklyPeriod.month}/weeks/${weeklyPeriod.weekIndex}`,
      )
    } else if (view === "デイリー") {
      navigateWithParams(getLatestPathForView("デイリー"))
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

  // 最近の期間は今日の日付から作るので、表示を引き継いだ（hydration）あとに出す。
  // サーバー（UTC）とブラウザ（日本時間）・保存済みの HTML と今日で日付がずれると React #418 で作り直しになる
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const carouselItems = isMounted ? generateCarouselItems() : []

  const handleRankingTypeChange = (type: "works" | "users") => {
    if (props.onRankingTypeChange) {
      props.onRankingTypeChange(type)
    }
  }

  const isWorksActive =
    !isAiRankingPage &&
    rankingFamily === "standard" &&
    props.rankingType !== "users"
  const canShowUsers =
    props.day !== null &&
    props.onRankingTypeChange !== undefined &&
    rankingFamily === "standard" &&
    !isAiRankingPage

  const handleWorksClick = () => {
    if (isAiRankingPage) {
      navigate(defaultRankingsPath)
      return
    }
    if (rankingFamily === "support") {
      props.onRankingFamilyChange
        ? props.onRankingFamilyChange("standard")
        : navigate(defaultRankingsPath)
      return
    }
    handleRankingTypeChange("works")
  }

  const familyTitle = isAiRankingPage
    ? t("AI評価ランキング", "AI rankings")
    : rankingFamily === "support"
      ? t("推し・貢献度ランキング", "Support rankings")
      : props.rankingType === "users"
        ? t("ユーザーランキング", "User rankings")
        : t("ランキング", "Rankings")

  const periodLabel =
    viewType === "デイリー" && day
      ? `${year}年${month}月${day}日`
      : viewType === "ウィークリー"
        ? `${year}年${month}月 第${weekIndex}週`
        : `${year}年${month}月`

  const chipClassName = (isActive: boolean) =>
    cn(appFilterChipClassName(isActive), "h-9 gap-1.5 px-3.5")

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE08A] to-[#E2A21B] shadow-[0_6px_16px_-6px_rgba(226,162,27,0.7)]"
          >
            <CrownIcon className="size-6 fill-white/40 text-white" />
          </span>
          <Heading className="min-w-0 font-black text-xl leading-tight md:text-2xl">
            {familyTitle}
            <span className="block truncate font-bold text-muted-foreground text-xs md:text-sm">
              {periodLabel}
              {props.day !== null && props.rankingType === "users"
                ? ` ・ ${t("最高いいね数で順位付け", "Ranked by most likes")}`
                : ""}
            </span>
          </Heading>
        </div>
        <SensitiveToggle
          variant="compact"
          targetUrl={rankingAgeTogglePath}
          label={isSensitiveRankingPage ? t("全年齢", "All Ages") : "R18"}
        />
      </div>

      {/* 期間（アプリと同じ丸いタブ） */}
      <div className={appPillRowClassName} role="tablist">
        {(
          [
            ["デイリー", t("デイリー", "Daily")],
            ["ウィークリー", t("ウィークリー", "Weekly")],
            ["マンスリー", t("マンスリー", "Monthly")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={viewType === value}
            onClick={() => {
              if (viewType !== value) handleViewChange(value)
            }}
            className={cn(
              appPillTabClassName(viewType === value),
              "flex-1 sm:flex-none",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 種類 */}
      {showRankingFamilyToggle && (
        <div className={appPillRowClassName}>
          <button
            type="button"
            onClick={handleWorksClick}
            aria-pressed={isWorksActive}
            className={chipClassName(isWorksActive)}
          >
            <ImageIcon className="size-4" />
            {t("作品", "Works")}
          </button>
          {canShowUsers && (
            <button
              type="button"
              onClick={() => handleRankingTypeChange("users")}
              aria-pressed={props.rankingType === "users"}
              className={chipClassName(props.rankingType === "users")}
            >
              <UsersIcon className="size-4" />
              {t("ユーザー", "Users")}
            </button>
          )}
          {!isAiRankingPage &&
            props.onRankingFamilyChange &&
            !isHideCoinSupport && (
              <button
                type="button"
                onClick={() => props.onRankingFamilyChange?.("support")}
                aria-pressed={rankingFamily === "support"}
                className={chipClassName(rankingFamily === "support")}
              >
                <HeartHandshakeIcon className="size-4" />
                {t("推し・貢献度", "Support")}
              </button>
            )}
          <button
            type="button"
            onClick={() => {
              if (!isAiRankingPage) navigate(aiRankingsPath)
            }}
            aria-pressed={isAiRankingPage}
            className={chipClassName(isAiRankingPage)}
          >
            <SparklesIcon className="size-4" />
            {t("AI評価", "AI rated")}
          </button>
          <Link
            to={toPopularWorksPath({
              isSensitive: pathnamePrefix.startsWith("/r/"),
            })}
            className={chipClassName(false)}
          >
            <TrophyIcon className="size-4" />
            {t("今日の人気", "Today's popular")}
          </Link>
          <Link
            to={
              pathnamePrefix.startsWith("/r/") ||
              defaultPathnamePrefix.startsWith("/r/")
                ? "/r/rankings/rookie"
                : "/rankings/rookie"
            }
            className={chipClassName(false)}
          >
            <SproutIcon className="size-4" />
            {t("ルーキー", "Rookie")}
          </Link>
        </div>
      )}

      {/* 日付（前へ・日付を選ぶ・次へ） */}
      <div className="flex items-center gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-1 rounded-full bg-muted p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            aria-label={t("前へ", "Previous")}
            className="size-9 shrink-0 rounded-full bg-background shadow-sm hover:bg-background/80"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <label className="relative flex h-9 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full font-extrabold text-sm">
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{periodLabel}</span>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              aria-label={t("ランキング日付", "Ranking date")}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              max={new Date().toISOString().split("T")[0]}
            />
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            aria-label={t("次へ", "Next")}
            className="size-9 shrink-0 rounded-full bg-background shadow-sm hover:bg-background/80"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
        <button
          type="button"
          onClick={handleTodayClick}
          className={cn(appFilterChipClassName(false), "h-11 px-4")}
        >
          {t("最新", "Latest")}
        </button>
      </div>

      {/* 最近の期間 */}
      <div className={cn(appPillRowClassName, "min-h-8")}>
        {carouselItems.map((item) => (
          <Link
            key={item.link}
            to={item.link}
            aria-current={item.border ? "page" : undefined}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-full px-3 font-bold text-xs tabular-nums transition-colors",
              item.border
                ? "bg-amber-500 text-white"
                : "bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
