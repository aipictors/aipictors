"use client"

import { Divider, HStack, Stack } from "@chakra-ui/react"
import { SensitiveCollectionCard } from "app/[lang]/sensitive/collections/_components/SensitiveCollectionCard"
import { SensitiveCollectionsHeader } from "app/[lang]/sensitive/collections/_components/SensitiveCollectionsHeader"

export const SensitiveCollectionList: React.FC = () => {
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
