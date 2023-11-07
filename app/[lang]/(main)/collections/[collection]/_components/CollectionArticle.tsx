"use client"

import { Stack } from "@chakra-ui/react"
import { CollectionHeader } from "./CollectionHeader"

export const CollectionArticle = () => {
  return (
    <Stack as={"article"} pr={4}>
      <CollectionHeader />
    </Stack>
  )
}
