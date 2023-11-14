"use client"

import { SensitiveCollectionCard } from "@/app/[lang]/sensitive/collections/_components/sensitive-collection-card"
import { SensitiveCollectionsHeader } from "@/app/[lang]/sensitive/collections/_components/sensitive-collections-header"
import { Divider, HStack, Stack } from "@chakra-ui/react"

export const SensitiveCollectionList = () => {
  return (
    <Stack>
      <SensitiveCollectionsHeader />
      <Divider />
      <HStack>
        <SensitiveCollectionCard />
        <SensitiveCollectionCard />
        <SensitiveCollectionCard />
      </HStack>
    </Stack>
  )
}
