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
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit) {
          ...PartialWorkFields
        }
      }
      followers(offset: $followersOffset, limit: $followersLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followersWorksOffset, limit: $followersWorksLimit) {
          ...PartialWorkFields
        }
      }
      biography
      enBiography
    }
  }
`)
