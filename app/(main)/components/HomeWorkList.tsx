"use client"
import { SimpleGrid } from "@chakra-ui/react"
import { FC } from "react"
import { WorksQuery } from "__generated__/apollo"
import { CardWork } from "app/(main)/works/components/CardWork"

type Props = {
  worksQuery: WorksQuery
}

export const HomeWorkList: FC<Props> = (props) => {
  return (
    <SimpleGrid
      w={"100%"}
      minChildWidth={{ base: "180px", md: "240px" }}
      spacing={2}
    >
      {props.worksQuery.works?.map((work) => (
        <CardWork key={work.id} imageURL={work.thumbnailImage?.downloadURL} />
      ))}
    </SimpleGrid>
  )
}
