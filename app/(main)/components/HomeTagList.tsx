"use client"
import { Box, Button, HStack } from "@chakra-ui/react"
import { FC } from "react"
import { HotTagsQuery } from "__generated__/apollo"

type Props = {
  hotTagsQuery: HotTagsQuery
}

export const HomeTagList: FC<Props> = (props) => {
  return (
    <Box w={"100%"} overflowX={"auto"} pb={2}>
      <HStack as={"ul"} w={"100%"} spacing={2}>
        {props.hotTagsQuery.hotTags?.map((tag) => (
          <Button
            as={"li"}
            key={tag.id}
            size={"sm"}
            minW={"fit-content"}
            variant={"outline"}
          >
            {tag.name}
          </Button>
        ))}
        <Box p={"4px"} />
      </HStack>
    </Box>
  )
}
