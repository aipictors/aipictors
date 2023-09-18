"use client"
import { SimpleGrid, Box } from "@chakra-ui/react"
import type { WorksQuery } from "__generated__/apollo"
import { CardWork } from "app/(main)/works/components/CardWork"

type Props = {
  worksQuery: WorksQuery
}

export const HomeWorkList: React.FC<Props> = (props) => {
  return (
    <SimpleGrid
      as={"ul"}
      w={"100%"}
      minChildWidth={{ base: "180px", md: "240px" }}
      spacing={2}
      pr={4}
    >
      {props.worksQuery.works?.map((work) => (
        <Box key={work.id}>
          <CardWork imageURL={work.thumbnailImage?.downloadURL} />
        </Box>
      ))}
    </SimpleGrid>
  )
}
