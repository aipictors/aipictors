import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarFallback } from "@/_components/ui/avatar"
import { Card, CardContent } from "@/_components/ui/card"
import type { AlbumQuery } from "@/_graphql/__generated__/graphql"
import { AvatarImage } from "@radix-ui/react-avatar"
import { userFolloweesQuery } from "@/_graphql/queries/user/user-followees"
import { skipToken, useSuspenseQuery } from "@apollo/client/index.js"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
type Props = {
  album: NonNullable<AlbumQuery["album"]>
}

export const AlbumWorkDescription = (props: Props) => {
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
    data?.user?.followees?.some(
      (followee) => followee.id === props.album.user.id,
    ) ?? false

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex">
            <Avatar>
              <AvatarImage
                src={props.album.thumbnailImage?.downloadURL ?? ""}
                alt={props.album.title}
              />
              <AvatarFallback />
            </Avatar>
            <p>{props.album.user.name}</p>
          </div>
          <div className="flex">
            <FollowButton
              isFollow={isFollow}
              targetUserId={props.album.user.id}
            />
          </div>
          <p>{props.album.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
