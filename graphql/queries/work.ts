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
        ...WorkUserFields
        viewer {
          id
          isFollower
          isFollowee
          isMuted
        }
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
