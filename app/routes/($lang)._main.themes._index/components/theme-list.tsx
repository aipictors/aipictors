import { Button } from "~/components/ui/button"
import { createCalendarCells } from "~/routes/($lang)._main.themes._index/utils/create-calendar-cells"
import { useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
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

    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: !shouldHideTitle ? theme?.title ?? null : null, // 7日後以降はお題内容を表示しない
      isSunday: dayOfWeek === 0, // 日曜日
      isSaturday: dayOfWeek === 6, // 土曜日
      isToday: isToday,
      date: `${props.year}-${String(props.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      thumbnailUrl: theme?.firstWork?.smallThumbnailImageURL ?? null,
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

    navigate(`/themes/${year}/${month}/${day}`)
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
        <div className="grid min-w-[768px] grid-cols-7 gap-2 md:gap-4">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="text-center font-bold">
              {day}
            </div>
          ))}
          {blocks.map((block) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
              key={block.id}
              onClick={() => handleCellClick(block.date)}
              className={`relative flex h-24 min-w-24 cursor-pointer flex-col gap-y-2 border p-2 ${block.isToday ? "bg-blue-200 dark:bg-blue-800" : ""}`}
            >
              <div
                className={`absolute text-right text-xs ${block.isSunday ? "text-red-500" : block.isSaturday ? "text-blue-500" : ""}`}
              >
                {block.day}
              </div>
              {block.thumbnailUrl && (
                <img
                  src={block.thumbnailUrl}
                  alt=""
                  className="absolute top-0 left-0 m-0 h-full w-full object-cover"
                />
              )}
              {block.thumbnailUrl && (
                <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40" />
              )}
              {block.title && block.thumbnailUrl && (
                <>
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 w-24 transform rounded-md p-2 text-center font-bold text-white">
                    {block.title}
                  </div>
                  <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-30 opacity-88" />
                </>
              )}
              {block.title && !block.thumbnailUrl && (
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 w-24 transform rounded-md p-2 text-center font-bold">
                  {block.title}
                </div>
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
  }`,
)

const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)

  return jstDate
}
