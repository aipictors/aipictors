import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"
import { AvatarImage } from "@radix-ui/react-avatar"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { type FragmentOf, graphql } from "gql.tada"
import type { AlbumArticleEditorDialogFragment } from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-editor-dialog"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  album: FragmentOf<typeof AlbumArticleEditorDialogFragment>
}

export function AlbumWorkDescription(props: Props) {
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

  const _isFollow =
    data?.user?.followees?.some(
      (followee) => followee.id === props.album.user.id,
    ) ?? false

  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={withIconUrlFallback(props.album.user.iconUrl)}
                alt={props.album.user.name}
              />
              <AvatarFallback />
            </Avatar>
            <p>{props.album.user.name}</p>
          </div>
          <p>{props.album.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const userFolloweesQuery = graphql(
  `query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        id
        nanoid
        login
        name
        iconUrl
        isFollowee
        isFollower
        iconUrl
      }
    }
  }`,
)
