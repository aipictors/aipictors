import { Button } from "~/components/ui/button"
import { createCalendarCells } from "~/routes/($lang)._main.themes._index/utils/create-calendar-cells"
import { Link, useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  year: number
  month: number
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
}

/**
 * お題カレンダーのセル一覧を作成する
 */
export function ThemeList(props: Props) {
  const navigate = useNavigate()

  // カレンダーセルを生成
  const cells = createCalendarCells(props.year, props.month)

  const currentDateInJapan = getJSTDate()

  const firstDayOfWeek = new Date(props.year, props.month - 1, 1).getDay() // 1日の曜日を取得

  const blocks = cells.map((day, index) => {
    const theme = props.dailyThemes.find((dailyTheme) => {
      return dailyTheme.day === day
    })

    const isToday =
      props.year === currentDateInJapan.getFullYear() &&
      props.month === currentDateInJapan.getMonth() + 1 &&
      day === currentDateInJapan.getDate()

    // 正しい曜日を算出
    const dayOfWeek = day ? (day + firstDayOfWeek - 1) % 7 : null

    // 現在の日付と比較
    const sevenDaysAfter = new Date(currentDateInJapan)

    sevenDaysAfter.setDate(currentDateInJapan.getDate() + 7)

    const shouldHideTitle = day
      ? new Date(props.year, props.month - 1, day) > sevenDaysAfter
      : false

    const isFuture = day
      ? new Date(props.year, props.month - 1, day) > currentDateInJapan
      : false

    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: !shouldHideTitle ? (theme?.title ?? null) : null, // 7日後以降はお題内容を表示しない
      isSunday: dayOfWeek === 0, // 日曜日
      isSaturday: dayOfWeek === 6, // 土曜日
      isToday: isToday,
      isFuture: isFuture,
      date: `${props.year}-${String(props.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      thumbnailUrl: isFuture
        ? null
        : (theme?.firstWork?.smallThumbnailImageURL ?? null),
      proposerId: theme?.proposer?.id ?? null,
      proposerName: theme?.proposer?.name ?? null,
    }
  })

  const onPreviousMonth = () => {
    const previousMonth = props.month - 1
    if (previousMonth < 1) {
      navigate(`/themes/${props.year - 1}/${12}`)
      return
    }
    navigate(`/themes/${props.year}/${previousMonth}`)
  }

  const onNextMonth = () => {
    const nextMonth = props.month + 1
    if (nextMonth > 12) {
      navigate(`/themes/${props.year + 1}/${1}`)
      return
    }
    navigate(`/themes/${props.year}/${nextMonth}`)
  }

  const handleCellClick = (date: string) => {
    const year = Number(date.slice(0, 4))
    const month = Number(date.slice(5, 7))
    const day = Number(date.slice(8, 10))

    // NaNなら何もしない
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return
    }

    navigate(`/themes/${year}/${month}/${day}?tab=list`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant={"secondary"}
          aria-label="previous month"
          onClick={onPreviousMonth}
        >
          <ChevronLeftIcon className="text-lg" />
        </Button>
        <p className="text-sm leading-none">
          {`${props.year}年${props.month}月`}
        </p>
        <Button
          variant={"secondary"}
          aria-label="next month"
          onClick={onNextMonth}
        >
          <ChevronRightIcon className="text-lg" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-0 md:min-w-[768px] md:gap-4">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="text-center font-bold">
              {day}
            </div>
          ))}
          {blocks.map((block) => (
            <div
              key={block.id}
              className={cn("relative", {
                "border-green-500": block.isSaturday,
                "border-red-500": block.isSunday,
              })}
            >
              <div
                onClick={() => handleCellClick(block.date)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCellClick(block.date)
                  }
                }}
                className={cn(
                  "relative flex h-24 cursor-pointer flex-col gap-y-2 border p-2 md:min-w-24",
                  {
                    "border-2 border-blue-500": block.isToday,
                  },
                )}
              >
                <div
                  className={cn("absolute z-10 text-right font-bold text-xs", {
                    "text-red-500": block.isSunday,
                    "text-blue-500": block.isSaturday,
                    "text-black": !block.isSunday && !block.isSaturday,
                    "text-white": block.thumbnailUrl && !block.isFuture,
                  })}
                >
                  {block.day}
                </div>
                {block.thumbnailUrl && !block.isFuture && (
                  <img
                    src={block.thumbnailUrl}
                    alt=""
                    className="absolute top-0 left-0 m-0 h-full w-full object-cover opacity-30 md:opacity-70"
                  />
                )}
                {block.title && block.thumbnailUrl && !block.isFuture && (
                  <>
                    <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 w-14 transform text-wrap rounded-md p-2 text-center font-bold text-white text-xs md:w-24 md:text-md">
                      {block.title}
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 box-border flex h-24 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80 md:h-24 md:opacity-100" />
                  </>
                )}
                {block.title && !block.thumbnailUrl && (
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 w-14 transform text-wrap rounded-md p-2 text-center font-bold text-xs md:w-24 md:text-md">
                    {block.title}
                  </div>
                )}
              </div>
              {block.proposerId && block.proposerId?.length !== 0 && (
                <Link
                  to={`/users/${block.proposerId}`}
                  className="absolute right-0 bottom-0 left-0 z-10 text-wrap bg-black bg-opacity-60 p-0 text-center text-sm text-white opacity-40"
                >
                  {block.proposerName}
                  {"さん案"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const ThemeListItemFragment = graphql(
  `fragment ThemeListItem on DailyThemeNode @_unmask {
    id
    title
    dateText
    year
    month
    day
    worksCount
    firstWork {
      id
      smallThumbnailImageURL
    }
    proposer {
      id
      name
      iconUrl
    }
  }`,
)

const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)

  return jstDate
}
