import { AuthContext } from "@/_contexts/auth-context"
import { userQuery } from "@/_graphql/queries/user/user"
import { useSuspenseQuery } from "@apollo/client/index"
import React from "react"
import { useContext } from "react"

export const DashboardContents = () => {
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
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  const followersCount = userResp?.data?.user?.followersCount

  const followCount = userResp?.data?.user?.followCount

  return (
    <>
      <div>
        <div className="flex space-x-1">
          {followersCount}
          フォロワー
        </div>
        <div className="flex space-x-1">
          {followCount}
          フォロー
        </div>
      </div>
    </>
  )
}
