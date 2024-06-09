import { partialFeedWorkFieldsFragment } from "@/_graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

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
