import { gql } from "@/graphql/__generated__"

export const feedDailyThemeWorksQuery = gql(`
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
`)
