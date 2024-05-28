import { gql } from "@/_graphql/__generated__"

export const userQuery = gql(`
  query User(
    $userId: ID!,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
  ) {
    user(id: $userId) {
      id
      biography
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconImage {
        id
        downloadURL
      }
      headerImage {
        id
        downloadURL
      }
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        name
        iconUrl
        headerImageUrl
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit) {
          ...PartialWorkFields
        }
      }
      followers(offset: $followersOffset, limit: $followersLimit) {
        name
        iconUrl
        headerImageUrl
        works(offset: $followersWorksOffset, limit: $followersWorksLimit) {
          ...PartialWorkFields
        }
      }
    }
  }
`)
