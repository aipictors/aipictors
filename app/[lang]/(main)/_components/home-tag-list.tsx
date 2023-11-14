"use client"

import type { HotTagsQuery } from "@/__generated__/apollo"
import { TagButton } from "@/app/[lang]/(main)/_components/tag-button"
import { Box, HStack } from "@chakra-ui/react"

type Props = {
  hotTags: HotTagsQuery
}

/**
 * ホーム上部に
 * @param props
 * @returns
 */
export const HomeTagList = (props: Props) => {
  return (
    <Box w={"100%"} overflowX={"auto"} pb={2}>
      <HStack as={"ul"} w={"100%"} spacing={2}>
        {props.hotTags.hotTags?.map((tag) => (
          <TagButton key={tag.id} id={tag.id} name={tag.name} />
        ))}
        <Box p={"4px"} />
      </HStack>
    </Box>
  )
}
