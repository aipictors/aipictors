"use client"

import type { DailyThemesQuery } from "@/__generated__/apollo"
import { ThemeListItem } from "@/app/[lang]/(main)/themes/_components/theme-list-item"
import { createCalendarCells } from "@/app/[lang]/(main)/themes/_utils/create-calendar-cells"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

type Props = {
  year: number
  month: number
  dailyThemesQuery: DailyThemesQuery
}

export const ThemeList = (props: Props) => {
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
    <div className="space-y-4">
      <div className="flex justify-center">
        <p className="text-lg">{"お題一覧"}</p>
      </div>
      <div className="flex justify-center space-x-4">
        <Button aria-label="previous month" onClick={onPreviousMonth}>
          <ChevronLeft className="text-lg" />
        </Button>
        <p className="text-sm leading-none">
          {`${props.year}年${props.month}月`}
        </p>
        <Button aria-label="next month" onClick={onNextMonth}>
          <ChevronRight className="text-lg" />
        </Button>
      </div>
      <ul className="w-full space-y-2 pr-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
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
