import { ResponsivePagination } from "@/_components/responsive-pagination"
import { Separator } from "@/_components/ui/separator"
import { AuthContext } from "@/_contexts/auth-context"
import { userQuery } from "@/_graphql/queries/user/user"
import { FollowerUserItem } from "@/routes/($lang).followers._index/_components/follower-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
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
