"use client"

import { Stack } from "@chakra-ui/react"
import { TagListItem } from "app/[lang]/(main)/tags/_components/tag-list-item"

export const TagList: React.FC = () => {
  return (
    <Stack>
      <TagListItem />
    </Stack>
  )
}
