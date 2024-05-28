import { AuthContext } from "@/_contexts/auth-context"
import { userQuery } from "@/_graphql/queries/user/user"
import { createClient } from "@/_lib/client"
import { FollowingUserItem } from "@/routes/($lang).following._index/_components/following-user-item"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"

export const FollowingList = () => {
  const authContext = useContext(AuthContext)

  const client = createClient()

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId,
      followeesOffset: 0,
      followeesLimit: 32,
      followeesWorksOffset: 0,
      followeesWorksLimit: 32,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })
  console.log(userResp.data)

  console.log(userResp.data?.user?.followees)

  return (
    <div className="grid grid-cols-3 gap-4">
      {userResp.data?.user?.followees.map((follower, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index}>
          <FollowingUserItem
            userName={follower.name}
            userIconImageURL={follower.iconUrl}
            works={follower.works.map((work) => ({
              id: work.id,
              title: work.title,
              thumbnailImageUrl: work.smallThumbnailImageURL,
            }))}
          />
        </div>
      ))}
    </div>
  )
}
