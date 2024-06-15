import { IconUrl } from "@/_components/icon-url"
import { Alert, AlertTitle } from "@/_components/ui/alert"
import { AuthContext } from "@/_contexts/auth-context"
import { userFollowersQuery } from "@/_graphql/queries/user/user-followers"
import { FolloweeListItem } from "@/routes/($lang)._main.my.followees/_components/followee-list-item"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { AlertCircleIcon } from "lucide-react"
import { useContext } from "react"

export const ViewerFollowerList = () => {
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(
    userFollowersQuery,
    appContext.isLoading || appContext.userId === null
      ? skipToken
      : {
          variables: {
            user_id: appContext.userId,
            offset: 0,
            limit: 128,
          },
        },
  )

  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"フォロワー"}</p>
        {data?.user?.followers?.length === 0 && (
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>{"誰もあなたをフォローしていません"}</AlertTitle>
          </Alert>
        )}
        <div
          className="flex flex-col divide-solid"
          //  divider={<Divider />}
        >
          {data?.user?.followers?.map((follower) => (
            <FolloweeListItem
              key={follower.id}
              name={follower.name}
              imageURL={IconUrl(follower.iconUrl)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
