"use client"
import { Stack } from "@chakra-ui/react"
import { CardNovel } from "app/(main)/novels/components/CardNovel"

export const NovelList: React.FC = () => {
  return (
    <Stack>
      <CardNovel />
    </Stack>
  )
}
