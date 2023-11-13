"use client"

import { Stack } from "@chakra-ui/react"
import { SensitiveCollectionHeader } from "./sensitive-collection-header"

export const SensitiveCollectionArticle = () => {
  return (
    <Stack as={"article"} pr={4}>
      <SensitiveCollectionHeader />
    </Stack>
  )
}
