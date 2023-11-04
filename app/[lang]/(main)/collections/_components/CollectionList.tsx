"use client"

import { Divider, HStack, Stack } from "@chakra-ui/react"
import { CollectionCard } from "app/[lang]/(main)/collections/_components/CollectionCard"
import { CollectionsHeader } from "app/[lang]/(main)/collections/_components/CollectionsHeader"

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
