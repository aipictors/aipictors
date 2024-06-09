import { partialFeedWorkFieldsFragment } from "@/_graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

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
