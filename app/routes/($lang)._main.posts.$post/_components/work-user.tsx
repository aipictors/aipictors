import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card"
import { PromptonRequestTextButton } from "@/routes/($lang)._main.posts.$post/_components/prompton-request-text-button"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { Link } from "@remix-run/react"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

type Props = {
  userId: string
  userLogin: string
  userName: string
  userIconImageURL?: string
  userFollowersCount: number
  userBiography: string | null
  userPromptonId?: string
  userWorksCount: number
}

/**
 * 作品へ投稿しているユーザの投稿数、フォロワ数、フォローするボタン等の情報
 */
export const WorkUser = (props: Props) => {
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

  const isFollow =
    data?.user?.followees?.some((followee) => followee.id === props.userId) ??
    false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gap-x-2 p-4">
          <Link to={`/users/${props.userLogin}`}>
            <Avatar className="m-auto h-auto w-24">
              <AvatarImage src={props.userIconImageURL} alt="" />
              <AvatarFallback />
            </Avatar>
            <p className="mt-2 text-center font-bold text-md">
              {props.userName}
            </p>
          </Link>
        </CardTitle>
        <div className="m-auto flex items-center space-x-1">
          <div className="flex items-center space-x-1">
            <p className="font-bold text-sm">{`${props.userWorksCount}`}</p>
            <p className="text-sm opacity-50">{"投稿"}</p>
          </div>
          <div className="flex items-center space-x-1">
            <p className="font-bold text-sm">{`${props.userFollowersCount}`}</p>
            <p className="text-sm opacity-50">{"フォロワー"}</p>
          </div>
        </div>
        <FollowButton targetUserId={props.userId} isFollow={isFollow} />
        {props.userPromptonId && (
          <PromptonRequestTextButton promptonId={props.userPromptonId} />
        )}
      </CardHeader>
      <CardDescription className="px-6 pb-4">
        {props.userBiography && (
          <CardDescription>{props.userBiography}</CardDescription>
        )}
      </CardDescription>
      {/* <CardFooter className="flex justify-between space-x-2">
        <FollowButton className="flex-1" />
        {props.userPromptonId && <PromptonRequestTextButton className="flex-1" />}
      </CardFooter> */}
    </Card>
  )
}

const userFolloweesQuery = graphql(
  `query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }`,
  [partialUserFieldsFragment],
)
