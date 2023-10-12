"use client"
import { Divider, HStack, Stack } from "@chakra-ui/react"
import { CardCollection } from "app/[lang]/(main)/collections/components/CardCollection"
import { CollectionsHeader } from "app/[lang]/(main)/collections/components/CollectionsHeader"

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
