import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Link } from "@remix-run/react"

type Props = {
  user: FragmentOf<typeof UserCardFragment>
}

export function UserCard (props: Props) {
  const user = readFragment(UserCardFragment, props.user)

  return (
    <Card className="rounded-lg border shadow-md">
      <CardHeader>
        <Link to={`/users/${user.login}`}>
          <div className="flex h-24 items-center space-x-4">
            <UserAvatarWithFrame
              alt={user.name || user.login}
              frame={user.avatarFrame}
              isAnimated={false}
              sizeClassName="size-10"
              src={withIconUrlFallback(user.iconUrl)}
            />
            <div>
              <CardTitle className="font-semibold text-xl">
                {user.name}
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                @{user.login}
              </CardDescription>
            </div>
          </div>
        </Link>
        <p className="text-sm">{user.biography}</p>
      </CardHeader>
      <CardContent>
        <ResponsivePhotoWorksAlbum works={user.works} />
      </CardContent>
    </Card>
  )
}

export const UserCardFragment = graphql(
  `fragment Users on UserNode {
    id
    login
    name
    iconUrl
    avatarFrame {
      id
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
    biography
    works(limit: 3, offset: 0) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
