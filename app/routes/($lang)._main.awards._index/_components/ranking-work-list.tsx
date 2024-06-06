import type { WorkAwardsQuery } from "@/_graphql/__generated__/graphql"
import { RankingCard } from "@/routes/($lang)._main.awards._index/_components/ranking-card"

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
            imageURL={props.work.smallThumbnailImageURL}
          />
        )
      })}
    </div>
  )
}
