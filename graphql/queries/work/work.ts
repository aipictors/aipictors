import { subWorkFieldsFragment } from "@/graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "@/graphql/fragments/user-fields"
import { gql } from "@apollo/client"

export const workQuery = gql`
  ${userFieldsFragment}
  ${subWorkFieldsFragment}
  query Work($id: ID!) {
    work(id: $id) {
      id
      title
      description
      imageURL
      user {
        promptonUser {
          id
        }
        ...UserFields
        isFollower
        isFollowee
        isMuted
        works(offset: 0, limit: 16) {
          id
          largeThumbnailImageURL
          largeThumbnailImageWidth
          largeThumbnailImageHeight
        }
      }
      dailyTheme {
        id
        title
      }
      tagNames
      createdAt
      likesCount
      viewsCount
      subWorks {
        ...SubWorkFields
      }
      isLiked
      isInCollection
    }
  }
`
