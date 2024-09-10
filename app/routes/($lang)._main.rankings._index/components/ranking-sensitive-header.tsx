import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useNavigate, useLocation } from "@remix-run/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

type Props = {
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

export function RankingSensitiveHeader(props: Props) {
  const [year, setYear] = useState(props.year)
  const [month, setMonth] = useState(props.month)
  const [day, setDay] = useState(props.day)
  const [weekIndex, setWeekIndex] = useState(props.weekIndex ?? 1)
  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : props.weekIndex ? "ウィークリー" : "マンスリー")
  const navigate = useNavigate()
  const location = useLocation()
  const isFirstRender = useRef(true)

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
    if (view === "ウィークリー") {
      setWeekIndex(1)
    }
  }

  const handleNavigate = () => {
    let newPath = ""

    if (viewType === "マンスリー") {
      newPath = `/sensitive/rankings/${year}/${month}`
    } else if (viewType === "デイリー") {
      const actualDay = day === 0 || day == null ? 1 : day
      newPath = `/sensitive/rankings/${year}/${month}/${actualDay}`
    } else if (viewType === "ウィークリー") {
      newPath = `/sensitive/rankings/${year}/${month}/weeks/${weekIndex}`
    }

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
    } else if (viewType === "マンスリー") {
      if (month === 1) {
        setMonth(12)
        setYear((prevYear) => prevYear - 1)
      } else {
        setMonth((prevMonth) => prevMonth - 1)
      }
    } else if (viewType === "ウィークリー") {
      if (weekIndex > 1) {
        setWeekIndex(weekIndex - 1)
      } else {
        const newDate = new Date(year, month - 1, 1)
        newDate.setDate(newDate.getDate() - 1)
        setYear(newDate.getFullYear())
        setMonth(newDate.getMonth() + 1)
        setWeekIndex(4) // Assuming 4 weeks in the previous month
      }
    }
  }

  const handleNext = () => {
    if (viewType === "デイリー" && day) {
      const newDate = new Date(year, month - 1, day + 1)
      setYear(newDate.getFullYear())
      setMonth(newDate.getMonth() + 1)
      setDay(newDate.getDate())
    } else if (viewType === "マンスリー") {
      if (month === 12) {
        setMonth(1)
        setYear((prevYear) => prevYear + 1)
      } else {
        setMonth((prevMonth) => prevMonth + 1)
      }
    } else if (viewType === "ウィークリー") {
      if (weekIndex < 4) {
        setWeekIndex(weekIndex + 1)
      } else {
        const newDate = new Date(year, month, 1)
        newDate.setDate(newDate.getDate() + 30)
        setYear(newDate.getFullYear())
        setMonth(newDate.getMonth() + 1)
        setWeekIndex(1)
      }
    }
  }

  const maxDay = new Date(year, month, 0).getDate()
  const maxYear = new Date().getFullYear()

  return (
    <Card className="flex flex-col items-center space-y-4 p-4">
      <p className="text-center font-bold text-md">ランキング</p>
      <div className="flex items-center">
        <Button variant={"ghost"} className="mr-2" onClick={handlePrevious}>
          <ChevronLeftIcon />
        </Button>
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
                value={day}
                onChange={handleDayChange}
                className="w-12 rounded-md border border-gray-300 text-center"
                min="1"
                max={maxDay}
              />
              <span>日</span>
            </>
          )}
          {viewType === "ウィークリー" && (
            <>
              <input
                type="number"
                value={weekIndex}
                onChange={(e) => setWeekIndex(Number(e.target.value))}
                className="w-12 rounded-md border border-gray-300 text-center"
                min="1"
                max="4"
              />
              <span>週</span>
            </>
          )}
        </div>
        <Button variant={"ghost"} className="ml-2" onClick={handleNext}>
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="flex w-full max-w-72 flex-col space-y-4 md:max-w-96">
        <div className="flex w-full justify-between space-x-1 md:space-x-4">
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("マンスリー")}
            className={viewType === "マンスリー" ? "rounded-lg " : "rounded-lg"}
            disabled={viewType === "マンスリー"}
          >
            月間
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("デイリー")}
            className={viewType === "デイリー" ? "rounded-lg " : "rounded-lg"}
            disabled={viewType === "デイリー"}
          >
            日間
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => handleViewChange("ウィークリー")}
            className={
              viewType === "ウィークリー" ? "rounded-lg " : "rounded-lg"
            }
            disabled={viewType === "ウィークリー"}
          >
            週間
          </Button>
        </div>
        {/* <div className="flex w-full justify-between space-x-1 md:space-x-4">
          <Button
            className="w-24"
            variant={"ghost"}
            onClick={() => navigate("/rankings")}
          >
            <RefreshCcwIcon className="mr-2 w-4" />
            {"全年齢"}
          </Button>
          <Button
            className="w-72 md:w-96"
            variant={"secondary"}
            onClick={handleNavigate}
          >
            {"変更した内容で表示"}
          </Button>
        </div> */}
      </div>
    </Card>
  )
}
