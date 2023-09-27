"use client"
import { Stack } from "@chakra-ui/react"
import { CollectionListItem } from "app/(main)/collections/components/CollectionListItem"

export const CollectionList: React.FC = () => {
  return (
    <Stack>
      <CollectionListItem />
    </Stack>
  )
}
