import { ResponsivePagination } from "@/_components/responsive-pagination"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { userQuery } from "@/_graphql/queries/user/user"
import { FollowingUserItem } from "@/routes/($lang).following._index/_components/following-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import React from "react"
import { useContext } from "react"

export const FollowingList = () => {
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
      followeesOffset: 16 * page,
      followeesLimit: 16,
      followeesWorksOffset: 0,
      followeesWorksLimit: 8,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })
  console.log(userResp.data)

  console.log(userResp.data?.user?.followees)

  return (
    <>
      <div>
        <div className="space-y-2">
          {userResp.data?.user?.followees.map((follower, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="space-y-2">
              <FollowingUserItem
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
