"use client"

import { SimpleGrid } from "@chakra-ui/react"
import type { WorkAwardsQuery } from "__generated__/apollo"
import { RankingCard } from "app/[lang]/(main)/awards/_components/ranking-card"

type Props = {
  awards: NonNullable<WorkAwardsQuery["workAwards"]>
}

export const RankingWorkList: React.FC<Props> = (props) => {
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 5 }} spacing={2}>
      {props.awards.map((props) => {
        return (
          <RankingCard
            key={props.id}
            title={props.work.title}
            imageURL={props.work.imageURL}
            // work={props.work}
          />
        )
      })}
    </SimpleGrid>
  )
}
