"use client"

import { Divider, HStack, Stack } from "@chakra-ui/react"
import { CollectionCard } from "app/[lang]/(main)/collections/_components/collection-card"
import { CollectionsHeader } from "app/[lang]/(main)/collections/_components/collections-header"

export const CollectionList: React.FC = () => {
  return (
    <Stack>
      <CollectionsHeader />
      <Divider />
      <HStack>
        <CollectionCard />
        <CollectionCard />
        <CollectionCard />
      </HStack>
    </Stack>
  )
}
