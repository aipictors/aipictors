"use client"

import type { WorkAwardsQuery } from "@/__generated__/apollo"
import { RankingCard } from "@/app/[lang]/(main)/awards/_components/ranking-card"

type Props = {
  awards: NonNullable<WorkAwardsQuery["workAwards"]>
}

export const RankingWorkList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
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
    </div>
  )
}
