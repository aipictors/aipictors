"use client"

import { Stack } from "@chakra-ui/react"
import { ViewerCollectionListItem } from "app/[lang]/(main)/my/collections/_components/viewer-collection-list-item"

export const ViewerCollectionList: React.FC = () => {
  return (
    <Stack>
      <ViewerCollectionListItem />
    </Stack>
  )
}
