"use client"
import type { WorksQuery } from "@/__generated__/apollo"
import { Link, SimpleGrid } from "@chakra-ui/react"

import { SensitiveWorkCard } from "@/app/[lang]/sensitive/works/_components/sensitive-work-card"

type Props = {
  works: NonNullable<WorksQuery["works"]>
}

export const SensitiveWorkList: React.FC<Props> = (props) => {
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
          <SensitiveWorkCard imageURL={work.largeThumbnailImageURL} />
        </Link>
      ))}
    </SimpleGrid>
  )
}
