"use client"

import type {
  UserFolloweesQuery,
  UserFolloweesQueryVariables,
} from "@/__generated__/apollo"
import { UserFolloweesDocument } from "@/__generated__/apollo"
import { FolloweeListItem } from "@/app/[lang]/(main)/my/followees/_components/followee-list-item"
import { AppContext } from "@/app/_contexts/app-context"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { AlertCircle } from "lucide-react"
import { useContext } from "react"

export const ViewerFolloweeList = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    UserFolloweesQuery,
    UserFolloweesQueryVariables
  >(
    UserFolloweesDocument,
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
            <AlertCircle />
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
              imageURL={followee.iconImage?.downloadURL}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
