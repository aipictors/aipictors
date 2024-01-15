"use client"

import { FolloweeListItem } from "@/app/[lang]/(main)/my/followees/_components/followee-list-item"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Alert, AlertTitle } from "@/components/ui/alert"
import type {
  UserFollowersQuery,
  UserFollowersQueryVariables,
} from "@/graphql/__generated__/graphql"
import { userFollowersQuery } from "@/graphql/queries/user/user-followers"
import { skipToken, useSuspenseQuery } from "@apollo/client"
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
              imageURL={follower.iconImage?.downloadURL}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
