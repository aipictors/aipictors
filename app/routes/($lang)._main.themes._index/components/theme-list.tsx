import { Button } from "~/components/ui/button"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createCalendarCells } from "~/routes/($lang)._main.themes._index/utils/create-calendar-cells"
import { useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
type Props = {
  year: number
  month: number
  dailyThemes: FragmentOf<typeof dailyThemeComponentFragment>[]
}

export const ThemeList = (props: Props) => {
  const navigate = useNavigate()

  const cells = createCalendarCells(props.year, props.month)

  const currentDateInJapan = getJSTDate()

  const blocks = cells.map((day, index) => {
    const theme = props.dailyThemes.find((dailyTheme) => {
      return dailyTheme.day === day
    })
    const isToday =
      props.year === currentDateInJapan.getFullYear() &&
      props.month === currentDateInJapan.getMonth() + 1 &&
      day === currentDateInJapan.getDate()
    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: theme?.title ?? null,
      isSunday: index % 7 === 0,
      isSaturday: index % 7 === 6,
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
          {blocks
            .filter((block) => block.title !== null)
            .map((block) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                key={block.id}
                onClick={() => handleCellClick(block.date)}
                className={`flex cursor-pointer flex-col space-y-2 border p-2 ${block.isToday ? "bg-blue-200 dark:bg-blue-800" : ""}`}
              >
                <div
                  className={`text-right text-xs ${block.isSunday ? "text-red-500" : block.isSaturday ? "text-blue-500" : ""}`}
                >
                  {block.day}
                </div>
                {block.title && (
                  <div className="mt-2 text-center text-sm">{block.title}</div>
                )}
                {block.thumbnailUrl && (
                  <img
                    src={block.thumbnailUrl}
                    alt=""
                    className="h-16 w-full rounded-md object-cover"
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export const dailyThemeComponentFragment = graphql(
  `fragment DailyThemeComponent on DailyThemeNode @_unmask {
    id
    title
    dateText
    year
    month
    day
    worksCount
    firstWork {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)

const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)

  return jstDate
}
