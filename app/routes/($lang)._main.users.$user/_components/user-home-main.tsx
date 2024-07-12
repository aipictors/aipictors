import { FollowButton } from "@/_components/button/follow-button"
import { Button } from "@/_components/ui/button"
import { PromptonRequestColorfulButton } from "@/routes/($lang)._main.posts.$post/_components/prompton-request-colorful-button"
import { graphql, type ResultOf } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { ProfileEditDialog } from "@/_components/profile-edit-dialog"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

type Props = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
  userId: string
}

export const UserHomeMain = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: userInfo } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(props.userId),
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      bookmarksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  const isFollow = userInfo?.user?.isFollowee ?? false

  return (
    <div className="relative m-auto h-64 w-full bg-neutral-100 md:h-24 dark:bg-neutral-900">
      <div className="absolute top-8 right-0 hidden md:block">
        <div className="flex items-center space-x-2">
          <FollowButton
            targetUserId={props.user.id}
            isFollow={isFollow}
            triggerChildren={
              <Button className="font-bold">フォローする</Button>
            }
            unFollowTriggerChildren={
              <Button variant={"secondary"}>フォロー中</Button>
            }
          />
          {props.user.promptonUser !== null &&
            props.user.promptonUser.id !== null && (
              <PromptonRequestColorfulButton
                rounded="rounded-md"
                promptonId={props.user.promptonUser.id}
                targetUserId={props.user.id}
              />
            )}
          {authContext.userId === props.user.id && (
            <ProfileEditDialog
              triggerChildren={
                <Button className="absolute top-4 right-4">
                  プロフィール編集
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="absolute top-40 left-0 block w-[100%] px-8 md:hidden">
        {authContext.userId !== props.user.id && (
          <FollowButton
            className="mb-2 w-[100%] rounded-full"
            targetUserId={"2"}
            isFollow={isFollow}
          />
        )}
        {props.user.promptonUser !== null &&
          props.user.promptonUser.id !== null && (
            <div className={"block w-[100%] rounded-full"}>
              <PromptonRequestColorfulButton
                rounded="rounded-full"
                promptonId={props.user.promptonUser.id}
                hideIcon={true}
                targetUserId={props.user.id}
              />
            </div>
          )}
        {authContext.userId === props.user.id && (
          <ProfileEditDialog
            triggerChildren={
              <Button className="w-full rounded-full">プロフィール編集</Button>
            }
          />
        )}
      </div>
    </div>
  )
}

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
