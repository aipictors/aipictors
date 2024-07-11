import { Button } from "@/_components/ui/button"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { ThemeListItem } from "@/routes/($lang)._main.themes._index/_components/theme-list-item"
import { createCalendarCells } from "@/routes/($lang)._main.themes._index/_utils/create-calendar-cells"
import { useNavigate } from "@remix-run/react"
import { graphql, type ResultOf } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type Props = {
  year: number
  month: number
  dailyThemes: ResultOf<typeof dailyThemesQuery>["dailyThemes"]
}

export const ThemeList = (props: Props) => {
  const navigate = useNavigate()

  const cells = createCalendarCells(2023, 9)

  const blocks = cells.map((day, index) => {
    const theme = props.dailyThemes.find((dailyTheme) => {
      return dailyTheme.day === day
    })
    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: theme?.title ?? null,
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

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <p className="text-lg">{"お題一覧"}</p>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <Button aria-label="previous month" onClick={onPreviousMonth}>
          <ChevronLeftIcon className="text-lg" />
        </Button>
        <p className="text-sm leading-none">
          {`${props.year}年${props.month}月`}
        </p>
        <Button aria-label="next month" onClick={onNextMonth}>
          <ChevronRightIcon className="text-lg" />
        </Button>
      </div>
      <ul className="grid w-full grid-cols-2 space-y-2 pr-4 md:grid-cols-4 lg:grid-cols-7">
        {blocks.map((block) => (
          <ThemeListItem
            key={block.id}
            year={props.year}
            month={props.month}
            day={block.day}
            title={block.title}
          />
        ))}
      </ul>
      <div className="space-y-4">
        <p className="text-sm">
          {"毎日のお題の希望のお題がございましたら下記より受け付けております！"}
        </p>
        <div className="flex">
          <Button>{"お題アイディア投稿BOX"}</Button>
        </div>
      </div>
    </div>
  )
}

export const dailyThemesQuery = graphql(
  `query DailyThemes(
    $offset: Int!
    $limit: Int!
    $where: DailyThemesWhereInput!
  ) {
    dailyThemes(offset: $offset, limit: $limit, where: $where) {
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
    }
  }`,
  [partialWorkFieldsFragment],
)
