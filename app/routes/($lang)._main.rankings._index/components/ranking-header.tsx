import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "@remix-run/react"
import { ChevronLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  year: number
  month: number
  day: number | null
}

export const RankingHeader = (props: Props) => {
  const [year, setYear] = useState(props.year)
  const [month, setMonth] = useState(props.month)
  const [day, setDay] = useState(props.day)
  const [viewType, setViewType] = useState<"マンスリー" | "デイリー">(
    "デイリー",
  )
  const navigate = useNavigate()

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setYear(Number(e.target.value))
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMonth(Number(e.target.value))
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDay(Number(e.target.value))

  const handleViewChange = (view: "マンスリー" | "デイリー") => {
    setViewType(view)
    if (view === "マンスリー") {
      navigate(`/rankings/${year}/${month}`)
    } else {
      setDay(1)
      navigate(`/rankings/${year}/${month}/1`)
    }
  }

  const handleNavigate = () => {
    if (viewType === "マンスリー") {
      navigate(`/rankings/${year}/${month}`)
    } else {
      navigate(`/rankings/${year}/${month}/${day}`)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col">
        <p className="text-center text-2xl">{"ランキング"}</p>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Link to={`/rankings/${props.year}/${props.month}/${props.day}`}>
              <ChevronLeftIcon />
            </Link>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                className="w-16 text-center"
                min="2000"
                max="2100"
              />
              <span>年</span>
              <input
                type="number"
                value={month}
                onChange={handleMonthChange}
                className="w-12 text-center"
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
                    className="w-12 text-center"
                    min="1"
                    max="31"
                  />
                  <span>日</span>
                </>
              )}
            </div>
            <Button onClick={handleNavigate}>変更</Button>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <Button
              onClick={() => handleViewChange("マンスリー")}
              className={
                viewType === "マンスリー" ? "bg-blue-500 text-white" : ""
              }
            >
              マンスリー
            </Button>
            <Button
              onClick={() => handleViewChange("デイリー")}
              className={
                viewType === "デイリー" ? "bg-blue-500 text-white" : ""
              }
            >
              デイリー
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
