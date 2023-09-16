"use client"
import { Box, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"
import { WorksQuery } from "__generated__/apollo"

type Props = {
  query: WorksQuery
}

export const SectionLatestWorks: FC<Props> = (props) => {
  return (
    <Stack p={4}>
      <Stack maxW={"lg"} spacing={2}>
        {props.query.works?.map((work) => (
          <Box key={work.id}>
            <Text>{work.id}</Text>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
