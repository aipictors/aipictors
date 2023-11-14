"use client"

import { NovelCard } from "@/app/[lang]/(main)/novels/_components/novel-card"
import { Stack } from "@chakra-ui/react"

export const NovelList = () => {
  return (
    <Stack>
      <NovelCard />
    </Stack>
  )
}
