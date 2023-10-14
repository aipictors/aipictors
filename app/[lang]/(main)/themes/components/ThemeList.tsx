"use client"
import {
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { DailyThemesQuery } from "__generated__/apollo"
import { ThemeListItem } from "app/[lang]/(main)/themes/components/ThemeListItem"
import { createCalendarCells } from "app/[lang]/(main)/themes/utils/createCalendarCells"
import { useRouter } from "next/navigation"
import { TbChevronLeft, TbChevronRight } from "react-icons/tb"

type Props = {
  year: number
  month: number
  dailyThemesQuery: DailyThemesQuery
}

export const ThemeList: React.FC<Props> = (props) => {
  const router = useRouter()

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

  const onPreviousMonth = () => {
    const previousMonth = props.month - 1
    if (previousMonth < 1) {
      router.push(`/themes/${props.year - 1}/${12}`)
      return
    }
    router.push(`/themes/${props.year}/${previousMonth}`)
  }

  const onNextMonth = () => {
    const nextMonth = props.month + 1
    if (nextMonth > 12) {
      router.push(`/themes/${props.year + 1}/${1}`)
      return
    }
    router.push(`/themes/${props.year}/${nextMonth}`)
  }

  return (
    <Stack>
      <HStack justifyContent={"center"}>
        <Text fontSize={"lg"}>{"お題一覧"} </Text>
      </HStack>
      <HStack justifyContent={"center"} spacing={4}>
        <IconButton
          aria-label="previous month"
          icon={<Icon as={TbChevronLeft} fontSize={"lg"} />}
          variant={"ghost"}
          borderRadius={"full"}
          onClick={onPreviousMonth}
        />
        <Text fontSize={"sm"} lineHeight={1}>
          {`${props.year}年${props.month}月`}
        </Text>
        <IconButton
          aria-label="next month"
          icon={<Icon as={TbChevronRight} fontSize={"lg"} />}
          variant={"ghost"}
          borderRadius={"full"}
          onClick={onNextMonth}
        />
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
