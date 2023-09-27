"use client"
import { Stack } from "@chakra-ui/react"
import { CollectionHeader } from "./CollectionHeader"
import { WorkList } from "app/(main)/works/components/WorkList"

export const CollectionArticle: React.FC = () => {
  return (
    <Stack as={"article"}>
      <CollectionHeader />
      <WorkList />
    </Stack>
  )
}
