"use client"

import { Stack } from "@chakra-ui/react"
import { CollectionHeader } from "./collection-header"

export const CollectionArticle = () => {
  return (
    <Stack as={"article"} pr={4}>
      <CollectionHeader />
    </Stack>
  )
}
