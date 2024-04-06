import { RankingCard } from "@/[lang]/(main)/awards/_components/ranking-card"
import type { WorkAwardsQuery } from "@/_graphql/__generated__/graphql"

type Props = {
  awards: NonNullable<WorkAwardsQuery["workAwards"]>
}

export const RankingWorkList = (props: Props) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 xl:grid-cols-5">
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
