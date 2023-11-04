"use client"

import { Link, SimpleGrid } from "@chakra-ui/react"
import type { WorksQuery } from "__generated__/apollo"
import { WorkCard } from "app/[lang]/(main)/works/_components/WorkCard"

type Props = {
  works: NonNullable<WorksQuery["works"]>
}

export const WorkList: React.FC<Props> = (props) => {
  return (
    <SimpleGrid
      as={"ul"}
      w={"100%"}
      minChildWidth={{ base: "180px", md: "240px" }}
      spacing={2}
      pr={4}
      pb={4}
    >
      {props.works.map((work) => (
        <Link key={work.id} href={`/works/${work.id}`}>
          <WorkCard imageURL={work.thumbnailImage?.downloadURL} />
        </Link>
      ))}
    </SimpleGrid>
  )
}
