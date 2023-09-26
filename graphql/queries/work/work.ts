import { gql } from "@apollo/client"

export const WORK = gql`
  query Work($id: ID!) {
    work(id: $id) {
      id
      title
      description
      image {
        id
        downloadURL
      }
      user {
        promptonUser {
          id
        }
        ...UserFields
        viewer {
          id
          isFollower
          isFollowee
          isMuted
        }
        works(offset: 0, limit: 16) {
          id
          thumbnailImage {
            id
            downloadURL
          }
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
      viewer {
        id
        isLiked
        isBookmarked
      }
    }
  }
`
