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
}

export const RankingHeader = (props: Props) => {
  const [year, setYear] = useState(props.year)
  const [month, setMonth] = useState(props.month)
  const [day, setDay] = useState(props.day)
  const [viewType, setViewType] = useState<
    "マンスリー" | "デイリー" | "ウィークリー"
  >(props.day ? "デイリー" : "マンスリー")
  const navigate = useNavigate()
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    setYear(props.year)
    setMonth(props.month)
    setDay(props.day)
  }, [props.year, props.month, props.day])

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
  }

  const handleNavigate = () => {
    let newPath = ""

    if (viewType === "マンスリー") {
      newPath = `/rankings/${year}/${month}`
    } else if (viewType === "デイリー") {
      const actualDay = day === 0 || day == null ? 1 : day
      newPath = `/rankings/${year}/${month}/${actualDay}`
    } else if (viewType === "ウィークリー") {
      newPath = `/rankings/${year}/${month}/week`
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
      const newDate = new Date(year, month - 1, day ?? new Date().getDate())
      newDate.setDate(newDate.getDate() - 7)
      setYear(newDate.getFullYear())
      setMonth(newDate.getMonth() + 1)
      setDay(newDate.getDate())
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
      const newDate = new Date(year, month - 1, day ?? new Date().getDate())
      newDate.setDate(newDate.getDate() + 7)
      setYear(newDate.getFullYear())
      setMonth(newDate.getMonth() + 1)
      setDay(newDate.getDate())
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
        </div>
        <Button variant={"ghost"} className="ml-2" onClick={handleNext}>
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="flex justify-center space-x-4">
        <Button
          variant={"secondary"}
          onClick={() => handleViewChange("マンスリー")}
          className={viewType === "マンスリー" ? "rounded-lg " : "rounded-lg"}
          disabled={viewType === "マンスリー"}
        >
          マンスリー
        </Button>
        <Button
          variant={"secondary"}
          onClick={() => handleViewChange("デイリー")}
          className={viewType === "デイリー" ? "rounded-lg " : "rounded-lg"}
          disabled={viewType === "デイリー"}
        >
          デイリー
        </Button>
        {/* <Button
          variant={"secondary"}
          onClick={() => handleViewChange("ウィークリー")}
          className={viewType === "ウィークリー" ? "rounded-lg " : "rounded-lg"}
          disabled={viewType === "ウィークリー"}
        >
          ウィークリー
        </Button> */}
      </div>
      <Button className="w-full" variant={"secondary"} onClick={handleNavigate}>
        変更を反映
      </Button>
    </Card>
  )
}
