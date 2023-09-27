"use client"
import { Stack } from "@chakra-ui/react"
import { CardCollection } from "app/(main)/collections/components/CardCollection"

export const CollectionList: React.FC = () => {
  return (
    <Stack>
      <CardCollection />
    </Stack>
  )
}
