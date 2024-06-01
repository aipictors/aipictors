import { gql } from "@/_graphql/__generated__"

export const userQuery = gql(`
  query User(
    $userId: ID!,
    $worksOffset: Int!,
    $worksLimit: Int!,
    $worksWhere: UserWorksWhereInput,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
    $followersWorksWhere: UserWorksWhereInput,
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
      followCount
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
      works(offset: $worksOffset, limit: $worksLimit, where: $worksWhere) {
        ...PartialWorkFields
      }
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        name
        iconUrl
        headerImageUrl
        biography
        isFollower
        isFollowee
        enBiography
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
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
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...PartialWorkFields
        }
      }
      biography
      enBiography
    }
  }
`)
