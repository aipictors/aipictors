import { gql } from "@apollo/client"

export default gql`
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
          largeThumbnailImageWith
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
