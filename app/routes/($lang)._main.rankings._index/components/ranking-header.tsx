import type React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "@remix-run/react"
import { ChevronLeftIcon } from "lucide-react"
import { Button } from "~/components/ui/button"

type Props = {
  year: number
  month: number
  day: number | null
}

export const RankingHeader = (props: Props) => {
  const [year, setYear] = useState(props.year)
  const [month, setMonth] = useState(props.month)
  const [day, setDay] = useState(props.day)
  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(day ? "デイリー" : "マンスリー")
  const navigate = useNavigate()

  useEffect(() => {
    setYear(props.year)
    setMonth(props.month)
    setDay(props.day)
  }, [props.year, props.month, props.day])

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setYear(Number(e.target.value))
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMonth(Number(e.target.value))
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDay(Number(e.target.value))

  const handleViewChange = (
    view: "マンスリー" | "デイリー" | "ウィークリー",
  ) => {
    setViewType(view)
    if (view === "マンスリー") {
      navigate(`/rankings/${year}/${month}`)
    } else if (view === "デイリー") {
      // 昨日の日付
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      // 昨日の日付を取得
      const yesterdayDay = yesterday.getDate()
      navigate(`/rankings/${year}/${month}/${yesterdayDay}`)
    } else if (view === "ウィークリー") {
      navigate(`/rankings/${year}/${month}/week`)
    }
  }

  const handleNavigate = () => {
    if (viewType === "マンスリー") {
      navigate(`/rankings/${year}/${month}`)
    } else if (viewType === "デイリー") {
      navigate(`/rankings/${year}/${month}/${day}`)
    } else if (viewType === "ウィークリー") {
      navigate(`/rankings/${year}/${month}/week`)
    }
  }

  const beforeLink = () => {
    if (props.day === null) {
      return `/rankings/${props.year}/${props.month - 1}`
    }
    if (props.day !== null) {
      if (props.day - 1 === 0) {
        // 先月の終盤の日付
        const lastDay = new Date(props.year, props.month - 1, 0).getDate()
        return `/rankings/${props.year}/${props.month - 1}/${lastDay}`
      }
      return `/rankings/${props.year}/${props.month}/${props.day - 1}`
    }
    return `/rankings/${props.year}/${props.month}`
  }

  const maxDay = new Date(year, month, 0).getDate()
  const maxYear = new Date().getFullYear()

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-center text-2xl">{"ランキング"}</p>
        <div className="flex items-center space-x-2">
          <Link to={beforeLink()}>
            <ChevronLeftIcon />
          </Link>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={year}
              onChange={handleYearChange}
              className="w-16 rounded-md border border-gray-300 text-center"
              min={"2023"}
              max={maxYear}
            />
            <span>年</span>
            <input
              type="number"
              value={month}
              onChange={handleMonthChange}
              className="w-12 rounded-md border border-gray-300 text-center"
              min="1"
              max="12"
            />
            <span>月</span>
            {viewType === "デイリー" && day && (
              <>
                <input
                  type="number"
                  // 今日の日付
                  value={day}
                  onChange={handleDayChange}
                  className="w-12 rounded-md border border-gray-300 text-center"
                  min="1"
                  max="31"
                />
                <span>日</span>
              </>
            )}
          </div>
          <Button
            variant={"secondary"}
            className="rounded-2xl"
            onClick={handleNavigate}
          >
            変更
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("マンスリー")}
            className={
              viewType === "マンスリー" ? "bg-blue-500 text-white" : ""
            }
            disabled={viewType === "マンスリー"}
          >
            マンスリー
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("デイリー")}
            className={viewType === "デイリー" ? "bg-blue-500 text-white" : ""}
            disabled={viewType === "デイリー"}
          >
            デイリー
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("ウィークリー")}
            className={
              viewType === "ウィークリー" ? "bg-blue-500 text-white" : ""
            }
            disabled={viewType === "ウィークリー"}
          >
            ウィークリー
          </Button>
        </div>
      </div>
    </div>
  )
}
