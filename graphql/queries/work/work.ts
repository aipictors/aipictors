import { gql } from "@/graphql/__generated__"

export const workQuery = gql(`
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
      nextWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
      }
      previousWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
      }
      isLiked
      isInCollection
    }
  }
`)
