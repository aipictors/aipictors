"use client"
import { SimpleGrid } from "@chakra-ui/react"
import type { FC } from "react"
import type { DailyThemesQuery } from "__generated__/apollo"
import { ThemeListItem } from "app/(main)/themes/components/ThemeListItem"

type Props = {
  year: number
  month: number
  dailyThemesQuery: DailyThemesQuery
}

const createCalendar = (year: number, month: number) => {
  const first = new Date(year, month - 1, 1).getDay()

  const last = new Date(year, month, 0).getDate()

  return [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const day = dayIndex + 1 + weekIndex * 7
      return day - 1 < first || last < day - first ? null : day - first
    })
  })
}

export const ThemeList: FC<Props> = (props) => {
  const calendar = createCalendar(2023, 9)
  console.log(calendar)

  const blocks = calendar.flat().map((day, index) => {
    const theme = props.dailyThemesQuery.dailyThemes?.find((dailyTheme) => {
      return dailyTheme.day === day
    })
    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: theme?.title ?? null,
    }
  })
  console.log(blocks)

  return (
    <SimpleGrid as={"ul"} w={"100%"} spacing={2} pr={4} columns={7}>
      {blocks.map((block) => (
        <ThemeListItem
          key={block.id}
          year={props.year}
          month={props.month}
          day={block.day}
          title={block.title}
        />
      ))}
    </SimpleGrid>
  )
}
