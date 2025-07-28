import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon, RefreshCcwIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  year: number
  month: number
  day: number | null
  weekIndex: number | null
  rankingType?: "works" | "users"
  onRankingTypeChange?: (type: "works" | "users") => void
}

export function RankingSensitiveHeader(props: Props) {
  const t = useTranslation()

  const [year, setYear] = useState(props.year)

  const [month, setMonth] = useState(props.month)

  const [day, setDay] = useState(props.day)

  const [weekIndex, setWeekIndex] = useState(props.weekIndex ?? 1)

  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : props.weekIndex ? "ウィークリー" : "マンスリー")

  const [date, setDate] = useState("")

  const navigate = useNavigate()

  const location = useLocation()

  const isFirstRender = useRef(true)

  // ステート変更を監視して遷移するためのuseEffectを追加
  useEffect(() => {
    if (!isFirstRender.current) {
      handleNavigate(year, month, day)
      setDate(new Date(year, month - 1, day || 1).toISOString().split("T")[0]) // カレンダーの日付を同期
    }
  }, [year, month, day, weekIndex])

  useEffect(() => {
    setYear(props.year)
    setMonth(props.month)
    setDay(props.day)
    setWeekIndex(props.weekIndex ?? 1)
  }, [props.year, props.month, props.day, props.weekIndex])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }
  }, [])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
    const selectedDate = new Date(e.target.value)
    setYear(selectedDate.getFullYear())
    setMonth(selectedDate.getMonth() + 1)
    setDay(selectedDate.getDate())
  }

  const handleTodayClick = () => {
    const today = new Date()
    const previousDay = new Date(today)
    previousDay.setDate(today.getDate() - 1)
    setYear(previousDay.getFullYear())
    setMonth(previousDay.getMonth() + 1)
    setDay(previousDay.getDate())
    setDate(previousDay.toISOString().split("T")[0])
    setViewType("デイリー") // 日間に切り替え
  }

  // URLパラメータを保持してナビゲートするヘルパー関数
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
      navigateWithParams(`/r/rankings/${year}/${month}/weeks/1`)
    } else if (view === "デイリー") {
      // 日間に切り替え時に最新の日付に移動
      const today = new Date()
      const previousDay = new Date(today)
      previousDay.setDate(today.getDate() - 1)
      navigateWithParams(
        `/r/rankings/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`,
      )
    } else {
      navigateWithParams(`/r/rankings/${year}/${month}`)
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
        ? `/r/rankings/${newYear}/${newMonth}/${actualDay}`
        : viewType === "ウィークリー"
          ? `/r/rankings/${newYear}/${newMonth}/weeks/${weekIndex}`
          : `/r/rankings/${newYear}/${newMonth}`

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
      setYear(newDate.getFullYear())
      setMonth(newDate.getMonth() + 1)
      setDay(newDate.getDate())
    }

    if (viewType === "マンスリー") {
      setMonth((prevMonth) => (prevMonth === 1 ? 12 : prevMonth - 1))
      if (month === 1) {
        setYear((prevYear) => prevYear - 1)
      }
    }

    if (viewType === "ウィークリー") {
      setWeekIndex((prevIndex) => (prevIndex > 1 ? prevIndex - 1 : 4))
      if (weekIndex === 1) {
        const newDate = new Date(year, month - 1, 1)
        newDate.setDate(newDate.getDate() - 1)
        setYear(newDate.getFullYear())
        setMonth(newDate.getMonth() + 1)
      }
    }
  }

  const handleNext = () => {
    if (viewType === "デイリー" && day) {
      const newDate = new Date(year, month - 1, day + 1)
      setYear(newDate.getFullYear())
      setMonth(newDate.getMonth() + 1)
      setDay(newDate.getDate())
    }

    if (viewType === "マンスリー") {
      setMonth((prevMonth) => (prevMonth === 12 ? 1 : prevMonth + 1))
      if (month === 12) {
        setYear((prevYear) => prevYear + 1)
      }
    }

    if (viewType === "ウィークリー") {
      setWeekIndex((prevIndex) => (prevIndex < 4 ? prevIndex + 1 : 1))
      if (weekIndex === 4) {
        const newDate = new Date(year, month, 1)
        newDate.setDate(newDate.getDate() + 30)
        setYear(newDate.getFullYear())
        setMonth(newDate.getMonth() + 1)
      }
    }
  }

  // ランキングタイプの変更ハンドラ
  const handleRankingTypeChange = (type: "works" | "users") => {
    if (props.onRankingTypeChange) {
      props.onRankingTypeChange(type)
    }
  }

  const generateCarouselItems = () => {
    const today = new Date()
    today.setDate(today.getDate() - 1) // ランキングは前日まで
    const items: { link: string; name: string; border: boolean }[] = []

    // 現在のURLパラメータを取得
    const currentSearchParams = new URLSearchParams(location.search)
    const searchString = currentSearchParams.toString()

    if (viewType === "デイリー") {
      for (let index = 0; index < 7; index++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (6 - index))
        const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`

        const basePath = `/r/rankings/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
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
      for (let index = 3; index >= 1; index--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - index)
        const formattedMonth = `${date.getFullYear()}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
        const basePath = `/r/rankings/${date.getFullYear()}/${date.getMonth() + 1}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath
        items.push({
          link: linkWithParams,
          name: formattedMonth,
          border: formattedMonth === `${year}/${month}`,
        })
      }
    }

    if (viewType === "ウィークリー") {
      for (let index = 0; index < 4; index++) {
        const weekNumber = index + 1 // 1週目から4週目を順に追加
        const basePath = `/r/rankings/${year}/${month}/weeks/${weekNumber}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath
        items.push({
          link: linkWithParams,
          name: `${weekNumber}${t("週目", "th week")}`,
          border: weekIndex === weekNumber,
        })
      }
    }

    return items
  }

  const carouselItems = generateCarouselItems()

  return (
    <Card className="flex flex-col items-center space-y-4 p-4">
      {/* ランキングタイプ切り替え */}
      {props.day !== null && props.onRankingTypeChange && (
        <div className="flex w-full max-w-72 justify-center space-x-2">
          <Button
            variant={props.rankingType === "works" ? "default" : "outline"}
            onClick={() => handleRankingTypeChange("works")}
            className="flex-1"
          >
            {t("作品ランキング", "Work Rankings")}
          </Button>
          <Button
            variant={props.rankingType === "users" ? "default" : "outline"}
            onClick={() => handleRankingTypeChange("users")}
            className="flex-1"
          >
            {t("ユーザランキング", "User Rankings")}
          </Button>
        </div>
      )}

      {/* ユーザーランキングの説明 */}
      {props.day !== null && props.rankingType === "users" && (
        <div className="w-full max-w-md rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 text-center dark:from-purple-900/20 dark:to-pink-900/20">
          <p className="font-semibold text-purple-700 text-sm dark:text-purple-300">
            📊 {t("平均いいね数でランキング", "Ranked by Average Likes")}
          </p>
          <p className="text-purple-600 text-xs dark:text-purple-400">
            {t(
              "投稿作品の平均いいね数で順位付けされています",
              "Ranked by average likes per work",
            )}
          </p>
        </div>
      )}
      {viewType === "マンスリー" && (
        <p className="text-center font-bold text-md">
          {t("マンスリー", "Monthly")}
        </p>
      )}
      {viewType === "デイリー" && (
        <p className="text-center font-bold text-md">
          {t("デイリー", "Daily")}
        </p>
      )}
      {viewType === "ウィークリー" && (
        <p className="text-center font-bold text-md">
          {t("ウィークリー", "Weekly")}
        </p>
      )}

      <p className="text-center font-bold text-md">
        {year}
        {t("年", "year")}
        {month}
        {t("月", "month")}
        {day
          ? `${day}${t("日", "day")}`
          : weekIndex && viewType !== "マンスリー"
            ? `${weekIndex}${t("週目", "th week")}`
            : ""}
        {t("のランキング", " Rankings")}
      </p>
      <div className="flex w-full max-w-72 flex-col space-y-4 md:max-w-72">
        <div className="flex w-full justify-between space-x-1 md:space-x-4">
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("マンスリー")}
            className={
              viewType === "マンスリー"
                ? "rounded-lg border-blue-500"
                : "rounded-lg"
            }
            disabled={viewType === "マンスリー"}
          >
            {t("月間", "Monthly")}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("デイリー")}
            className={
              viewType === "デイリー"
                ? "rounded-lg border-blue-500"
                : "rounded-lg"
            }
            disabled={viewType === "デイリー"}
          >
            {t("日間", "Daily")}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("ウィークリー")}
            className={
              viewType === "ウィークリー"
                ? "rounded-lg border-blue-500"
                : "rounded-lg"
            }
            disabled={viewType === "ウィークリー"}
          >
            {t("週間", "Weekly")}
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-x-2 space-y-2 md:flex-row">
        <div className="flex items-center space-x-4">
          <Button variant={"ghost"} onClick={handlePrevious}>
            <ChevronLeftIcon />
            {t("前へ", "Previous")}
          </Button>
          <Button variant={"ghost"} onClick={handleNext}>
            {t("次へ", "Next")}
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-[200px] rounded-md border border-gray-300"
            max={new Date().toISOString().split("T")[0]} // 今日の日付以降は選べない
          />
          <Button onClick={handleTodayClick} variant="outline">
            {t("最新", "Latest")}
          </Button>
        </div>
        <Button
          className="w-full"
          variant={"secondary"}
          onClick={() => navigate("/rankings")}
        >
          <RefreshCcwIcon className="mr-2 w-4" />
          {t("全年齢", "All Ages")}
        </Button>
      </div>
      <div className="mt-4 flex max-w-72 space-x-4 md:max-w-full">
        <Carousel
          className="relative overflow-hidden"
          opts={{ dragFree: true, loop: false, align: "center" }}
        >
          <CarouselContent>
            {carouselItems.map((item, index) => (
              <CarouselItem key={item.link} className="basis-auto">
                <TagButton
                  key={index.toString()}
                  link={item.link}
                  name={item.name}
                  border={item.border} // 選択したタグにボーダーを追加
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-0" />
          <CarouselNext className="absolute top-1/2 right-0" />
        </Carousel>
      </div>
    </Card>
  )
}
