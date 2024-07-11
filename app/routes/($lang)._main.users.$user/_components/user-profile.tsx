import { FollowButton } from "@/_components/button/follow-button"
import { UserProfileAvatar } from "@/routes/($lang)._main.users.$user/_components/user-profile-avatar"
import UserProfileInfo from "./user-profile-info"
import { graphql, type ResultOf } from "gql.tada"
import { IconUrl } from "@/_components/icon-url"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

type UserProfileProps = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
}

const UserProfile = (props: UserProfileProps) => {
  return (
    <header className="relative h-64 px-4">
      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center bg-gradient-to-t from-background/40 px-4 py-6">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            alt={props.user.name}
            src={IconUrl(props.user.iconUrl)}
          />
          <UserProfileInfo
            name={props.user.name}
            receivedLikesCount={props.user.receivedLikesCount}
            receivedViewsCount={props.user.receivedViewsCount}
            awardsCount={props.user.awardsCount}
            followersCount={props.user.followersCount}
            biography={props.user.biography || ""}
          />
        </div>
        <FollowButton targetUserId={props.user.id} isFollow={false} />
      </div>
    </header>
  )
}

export default UserProfile

export const userQuery = graphql(
  `query User(
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
    $bookmarksOffset: Int!,
    $bookmarksLimit: Int!,
    $bookmarksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      biography
      createdBookmarksCount
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followCount
      followersCount
      worksCount
      iconUrl
      headerImageUrl
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
      bookmarkWorks(offset: $bookmarksOffset, limit: $bookmarksLimit, where: $bookmarksWhere) {
        ...PartialWorkFields
      }
      featuredSensitiveWorks {
        ...PartialWorkFields
      }
      featuredWorks {
        ...PartialWorkFields
      }
      biography
      enBiography
      instagramAccountId
      twitterAccountId
      githubAccountId
      siteURL
      mailAddress
      promptonUser {
        id
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
