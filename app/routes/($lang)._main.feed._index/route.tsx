import { partialFeedWorkFieldsFragment } from "~/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export default function Route() {
  return null
}

export const feedDailyThemeWorksQuery = graphql(
  `query FeedDailyThemeWorks(
    $year: Int!
    $month: Int!
    $day: Int!
    $offset: Int!
    $limit: Int!
  ) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      works(offset: $offset, limit: $limit) {
        ...PartialFeedWorkFields
        user {
          ...PartialUserFields
          isFollower
          isFollowee
          isMuted
        }
        isLiked
        isInCollection
      }
    }
  }`,
  [partialFeedWorkFieldsFragment, partialUserFieldsFragment],
)

export const feedHotWorksQuery = graphql(
  `query FeedHotWorks {
    hotWorks {
      ...PartialFeedWorkFields
      user {
        ...PartialUserFields
        isFollower
        isFollowee
        isMuted
      }
      isLiked
      isInCollection
    }
  }`,
  [partialFeedWorkFieldsFragment, partialUserFieldsFragment],
)

export const feedLatestWorksQuery = graphql(
  `query FeedLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialFeedWorkFields
      user {
        ...PartialUserFields
        isFollower
        isFollowee
        isMuted
      }
      isLiked
      isInCollection
    }
  }`,
  [partialFeedWorkFieldsFragment, partialUserFieldsFragment],
)
