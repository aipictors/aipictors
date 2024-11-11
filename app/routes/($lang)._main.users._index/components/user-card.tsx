import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Link } from "@remix-run/react"

type Props = {
  user: FragmentOf<typeof UserCardFragment>
}

export function UserCard(props: Props) {
  const user = readFragment(UserCardFragment, props.user)

  return (
    <Card className="rounded-lg border shadow-md">
      <CardHeader>
        <Link to={`/users/${user.login}`}>
          <div className="flex h-24 items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={withIconUrlFallback(user.iconUrl)}
                alt={user.name || user.login}
              />
              <AvatarFallback>
                {user.name ? user.name.charAt(0) : user.login.charAt(0)}
              </AvatarFallback>
            </Avatar>
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
    biography
    works(limit: 3, offset: 0) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
