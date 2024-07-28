import { ResponsivePagination } from "@/components/responsive-pagination"
import { Separator } from "@/components/ui/separator"
import { AuthContext } from "@/contexts/auth-context"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { FollowerUserItem } from "@/routes/($lang).followers._index/components/follower-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import React from "react"
import { useContext } from "react"

export const FollowerList = () => {
  const [page, setPage] = React.useState(0)

  const authContext = useContext(AuthContext)

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  const userResp = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId,
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
      followersOffset: 16 * page,
      followersLimit: 16,
      followersWorksOffset: 16,
      followersWorksLimit: 16,
    },
  })

  return (
    <>
      <div>
        <div className="space-y-2">
          {userResp.data?.user?.followers.map((follower, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="space-y-2">
              <FollowerUserItem
                userId={follower.id}
                userName={follower.name}
                userIconImageURL={follower.iconUrl}
                biography={follower.biography ?? ""}
                isFollow={follower.isFollowee}
                works={follower.works.map((work) => ({
                  id: work.id,
                  title: work.title,
                  thumbnailImageUrl: work.smallThumbnailImageURL,
                }))}
              />
              <Separator />
            </div>
          ))}
        </div>
        <ResponsivePagination
          perPage={16}
          maxCount={userResp.data?.user?.followersCount ?? 0}
          currentPage={page}
          onPageChange={(page: number) => {
            setPage(page)
          }}
        />
      </div>
    </>
  )
}

const userQuery = graphql(
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
