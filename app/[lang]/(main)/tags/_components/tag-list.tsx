"use client"

import { TagListItem } from "@/app/[lang]/(main)/tags/_components/tag-list-item"
import { Stack } from "@chakra-ui/react"

export const TagList: React.FC = () => {
  return (
    <Stack>
      <TagListItem />
    </Stack>
  )
}
