import { FollowButton } from "@/components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PromptonRequestTextButton } from "@/routes/($lang)._main.posts.$post/components/prompton-request-text-button"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { Link } from "@remix-run/react"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
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
      </CardHeader>
      <CardContent className="flex w-full flex-col space-y-4">
        <div className="m-auto flex items-center space-x-4">
          <div className="flex items-center">
            <p className="font-bold text-sm">{`${props.userWorksCount}`}</p>
            <p className="text-sm opacity-50">{"投稿"}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold text-sm">{`${props.userFollowersCount}`}</p>
            <p className="text-sm opacity-50">{"フォロワー"}</p>
          </div>
        </div>
        <FollowButton targetUserId={props.userId} isFollow={isFollow} />
        {props.userPromptonId && props.userId !== appContext.userId && (
          <PromptonRequestTextButton promptonId={props.userPromptonId} />
        )}
      </CardContent>
      <CardDescription className="px-6 pb-4">
        {props.userBiography && (
          <CardDescription>{props.userBiography}</CardDescription>
        )}
      </CardDescription>
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
