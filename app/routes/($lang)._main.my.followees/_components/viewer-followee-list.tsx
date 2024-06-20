import { IconUrl } from "@/_components/icon-url"
import { Alert, AlertTitle } from "@/_components/ui/alert"
import { AuthContext } from "@/_contexts/auth-context"
import { userFolloweesQuery } from "@/_graphql/queries/user/user-followees"
import { FolloweeListItem } from "@/routes/($lang)._main.my.followees/_components/followee-list-item"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { AlertCircleIcon } from "lucide-react"
import { useContext } from "react"

export const ViewerFolloweeList = () => {
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(
    userFolloweesQuery,
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
        <p className="text-2xl">{"フォローしているユーザ"}</p>
        {data?.user?.followees?.length === 0 && (
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>{"フォローしているユーザはいません"}</AlertTitle>
          </Alert>
        )}
        <div
          className="flex flex-col divide-solid"
          //  divider={<Divider />}
        >
          {data?.user?.followees?.map((followee) => (
            <FolloweeListItem
              key={followee.id}
              name={followee.name}
              imageURL={IconUrl(followee.iconUrl)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
