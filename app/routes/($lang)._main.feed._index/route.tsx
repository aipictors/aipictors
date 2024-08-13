import { graphql } from "gql.tada"

export default function Route() {
  return null
}

export const FeedDailyThemeWorksQuery = graphql(
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
        user {
          isFollower
          isFollowee
          isMuted
        }
        isLiked
        isInCollection
      }
    }
  }`,
  [],
)

export const FeedHotWorksQuery = graphql(
  `query FeedHotWorks {
    hotWorks {
      user {
        isFollower
        isFollowee
        isMuted
      }
      isLiked
      isInCollection
    }
  }`,
  [],
)

export const FeedLatestWorksQuery = graphql(
  `query FeedLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      user {
        isFollower
        isFollowee
        isMuted
      }
      isLiked
      isInCollection
    }
  }`,
  [],
)
