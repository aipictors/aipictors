import { partialFeedWorkFieldsFragment } from "@/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const feedDailyThemeWorksQuery = gql`
  ${partialFeedWorkFieldsFragment}
  ${partialUserFieldsFragment}
  query FeedDailyThemeWorks(
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
  }
`
