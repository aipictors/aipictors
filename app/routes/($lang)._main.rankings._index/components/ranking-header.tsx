import type React from "react"
import { useEffect, useState, useRef } from "react"
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
}

export function RankingHeader(props: Props) {
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

  useEffect(() => {
    if (!isFirstRender.current) {
      handleNavigate(year, month, day)
      const jstDate = new Date(year, month - 1, day || 1)
      jstDate.setHours(jstDate.getHours() + 9) // 日本時間に合わせる
      setDate(jstDate.toISOString().split("T")[0])
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
    setViewType("デイリー")
  }

  const handleViewChange = (
    view: "マンスリー" | "デイリー" | "ウィークリー",
  ) => {
    setViewType(view)
    if (view === "ウィークリー") {
      setWeekIndex(1)
    } else if (view === "デイリー") {
      const today = new Date()
      const previousDay = new Date(today)
      previousDay.setDate(today.getDate() - 1)
      setYear(previousDay.getFullYear())
      setMonth(previousDay.getMonth() + 1)
      setDay(previousDay.getDate())
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

    if (location.pathname !== newPath) {
      navigate(newPath)
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

  const generateCarouselItems = () => {
    const today = new Date()
    today.setDate(today.getDate() - 1)
    const items: { link: string; name: string; border: boolean }[] = []

    if (viewType === "デイリー") {
      for (let index = 0; index < 7; index++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (6 - index))
        const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`
        items.push({
          link: `/rankings/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
          name: formattedDate,
          border:
            `${props.year}/${props.month}/${props.day}` ===
            `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
        })
      }
    }

    if (viewType === "マンスリー") {
      for (let index = 0; index < 3; index++) {
        const date = new Date(today)
        date.setMonth(today.getMonth() + index)
        const formattedMonth = `${date.getFullYear()}/${(date.getMonth() - 2)
          .toString()
          .padStart(2, "0")}`
        items.push({
          link: `/rankings/${date.getFullYear()}/${date.getMonth() - 2}`,
          name: formattedMonth,
          border: formattedMonth === `${year}/${month}`,
        })
      }
    }

    if (viewType === "ウィークリー") {
      for (let index = 0; index < 4; index++) {
        const weekNumber = index + 1
        items.push({
          link: `/rankings/${year}/${month}/weeks/${weekNumber}`,
          name: `${t(`${weekNumber}週目`, `${weekNumber}th Week`)}`,
          border: weekIndex === weekNumber,
        })
      }
    }

    return items
  }

  const maxDay = new Date(year, month, 0).getDate()
  const maxYear = new Date().getFullYear()
  const carouselItems = generateCarouselItems()

  return (
    <Card className="flex flex-col items-center space-y-4 p-4">
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
