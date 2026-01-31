import {
  RecommendedWorksListTable,
  RecommendedWorksTableItemFragment,
} from "~/routes/($lang).my._index/components/recommended-works-list-table"
import {
  MobileRecommendedWorkItemFragment,
  RecommendedWorksSpList,
} from "~/routes/($lang).my._index/components/recommended-works-sp-list"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof RecommendedWorkListItemFragment>[]
}

/**
 * 推薦作品一覧
 */
export function RecommendedWorksList (props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <RecommendedWorksListTable works={props.works} />
      </div>
      <div className="block md:hidden">
        <RecommendedWorksSpList works={props.works} />
      </div>
    </>
  )
}

export const RecommendedWorkListItemFragment = graphql(
  `fragment RecommendedWorkListItem on WorkNode @_unmask {
    ...RecommendedWorksTableItem
    ...MobileRecommendedWorkItem
  }`,
  [RecommendedWorksTableItemFragment, MobileRecommendedWorkItemFragment],
)
