"use client"

import { ViewerCollectionListItem } from "@/app/[lang]/(main)/my/collections/_components/viewer-collection-list-item"
import { Stack } from "@chakra-ui/react"

export const ViewerCollectionList: React.FC = () => {
  return (
    <Stack>
      <ViewerCollectionListItem />
    </Stack>
  )
}
