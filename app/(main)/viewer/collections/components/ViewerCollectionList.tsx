"use client"
import { Stack } from "@chakra-ui/react"
import { ViewerCollectionListItem } from "app/(main)/viewer/collections/components/ViewerCollectionListItem"

export const ViewerCollectionList: React.FC = () => {
  return (
    <Stack>
      <ViewerCollectionListItem />
    </Stack>
  )
}
