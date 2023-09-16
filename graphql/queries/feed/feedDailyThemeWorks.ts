import { gql } from "@apollo/client"

export const FEED_DAILY_THEME_WORKS = gql`
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
          viewer {
            id
            isFollower
            isFollowee
            isMuted
          }
        }
        viewer {
          id
          isLiked
          isBookmarked
        }
      }
    }
  }
`
