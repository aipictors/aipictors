import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
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
import { RankingHeaderSensitiveConfirmDialog } from "~/routes/($lang)._main.rankings._index/components/ranking-header-sensitive-confirm-dialog"

type Props = {
  year: number
  month: number
  day: number | null
  weekIndex: number | null
  rankingType?: "works" | "users"
  onRankingTypeChange?: (type: "works" | "users") => void
}

export function RankingHeader(props: Props) {
  const t = useTranslation()

  // props から直接値を取得（ローカル状態を削除）
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
    handleNavigate(newYear, newMonth, newDay)
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
      const newWeekIndex = weekIndex > 1 ? weekIndex - 1 : 4
      if (weekIndex === 1) {
        const newDate = new Date(year, month - 1, 1)
        newDate.setDate(newDate.getDate() - 1)
        navigateWithParams(
          `/rankings/${newDate.getFullYear()}/${newDate.getMonth() + 1}/weeks/${newWeekIndex}`,
        )
      } else {
        navigateWithParams(`/rankings/${year}/${month}/weeks/${newWeekIndex}`)
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
      const newWeekIndex = weekIndex < 4 ? weekIndex + 1 : 1
      if (weekIndex === 4) {
        const newDate = new Date(year, month, 1)
        newDate.setDate(newDate.getDate() + 30)
        navigateWithParams(
          `/rankings/${newDate.getFullYear()}/${newDate.getMonth() + 1}/weeks/${newWeekIndex}`,
        )
      } else {
        navigateWithParams(`/rankings/${year}/${month}/weeks/${newWeekIndex}`)
      }
    }
  }

  const generateCarouselItems = () => {
    const today = new Date()
    today.setDate(today.getDate() - 1)
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
      for (let index = 3; index >= 1; index--) {
        const date = new Date(today)
        date.setMonth(today.getMonth() - index)
        const formattedMonth = `${date.getFullYear()}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
        const basePath = `/rankings/${date.getFullYear()}/${date.getMonth() + 1}`
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
        const weekNumber = index + 1
        const basePath = `/rankings/${year}/${month}/weeks/${weekNumber}`
        const linkWithParams = searchString
          ? `${basePath}?${searchString}`
          : basePath
        items.push({
          link: linkWithParams,
          name: `${t(`${weekNumber}週目`, `${weekNumber}th Week`)}`,
          border: weekIndex === weekNumber,
        })
      }
    }

    return items
  }

  const carouselItems = generateCarouselItems()

  // ランキングタイプの変更ハンドラ
  const handleRankingTypeChange = (type: "works" | "users") => {
    if (props.onRankingTypeChange) {
      props.onRankingTypeChange(type)
    }
  }

  // デバッグ用ログ
  console.log("RankingHeader props:", {
    day: props.day,
    rankingType: props.rankingType,
    hasOnRankingTypeChange: !!props.onRankingTypeChange,
    viewType,
  })

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
        {year}年{month}月
        {day
          ? `${day}日`
          : weekIndex && viewType !== "マンスリー"
            ? `${weekIndex}週目`
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
            max={new Date().toISOString().split("T")[0]}
          />
          <Button onClick={handleTodayClick} variant="outline">
            {t("最新", "Latest")}
          </Button>
        </div>
        <RankingHeaderSensitiveConfirmDialog />
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
                  border={item.border}
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
