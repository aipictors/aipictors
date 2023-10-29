"use client"
import { Stack } from "@chakra-ui/react"
import { NovelCard } from "app/[lang]/(main)/novels/_components/NovelCard"

export const NovelList: React.FC = () => {
  return (
    <Stack>
      <NovelCard />
    </Stack>
  )
}
