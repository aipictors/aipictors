"use client"
import { HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"
import { DailyThemesQuery } from "__generated__/apollo"
import { ThemeListItem } from "app/(main)/themes/components/ThemeListItem"
import { createCalendarCells } from "app/(main)/themes/utils/createCalendarCells"

type Props = {
  year: number
  month: number
  dailyThemesQuery: DailyThemesQuery
}

export const ThemeList: FC<Props> = (props) => {
  const cells = createCalendarCells(2023, 9)

  const blocks = cells.map((day, index) => {
    const theme = props.dailyThemesQuery.dailyThemes?.find((dailyTheme) => {
      return dailyTheme.day === day
    })
    return {
      id: `/${props.year}-${props.month}-${index}`,
      day: day,
      title: theme?.title ?? null,
    }
  })

  return (
    <Stack>
      <HStack justifyContent={"center"}>
        <Text fontSize={"lg"}>{"お題一覧"} </Text>
      </HStack>
      <HStack justifyContent={"center"}>
        <Text fontSize={"sm"}>{`${props.year}年${props.month}月`}</Text>
      </HStack>
      <SimpleGrid
        as={"ul"}
        w={"100%"}
        spacing={2}
        pr={4}
        columns={{ base: 2, md: 4, lg: 7 }}
        justifyItems={""}
      >
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
    </Stack>
  )
}
