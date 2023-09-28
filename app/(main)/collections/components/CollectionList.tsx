"use client"
import { Divider, HStack, Stack } from "@chakra-ui/react"
import { CardCollection } from "app/(main)/collections/components/CardCollection"
import { CollectionsHeader } from "app/(main)/collections/components/CollectionsHeader"

export const CollectionList: React.FC = () => {
  return (
    <Stack>
      <CollectionsHeader />
      <Divider />
      <HStack>
        <CardCollection />
        <CardCollection />
        <CardCollection />
      </HStack>
    </Stack>
  )
}
