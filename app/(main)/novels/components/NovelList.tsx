"use client"
import { Stack } from "@chakra-ui/react"
import { NovelListItem } from "app/(main)/novels/components/NovelListItem"

export const NovelList: React.FC = () => {
  return (
    <Stack>
      <NovelListItem />
    </Stack>
  )
}
