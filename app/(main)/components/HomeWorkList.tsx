"use client"
import { SimpleGrid } from "@chakra-ui/react"
import Link from "next/link"
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
      pb={4}
    >
      {props.worksQuery.works?.map((work) => (
        <Link key={work.id} href={`/works/${work.id}`}>
          <CardWork imageURL={work.thumbnailImage?.downloadURL} />
        </Link>
      ))}
    </SimpleGrid>
  )
}
