import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { IconUrl } from "~/components/icon-url"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

type Props = {
  users: FragmentOf<typeof HomeNewPostedUsersFragment>[]
}

/**
 * 新規ユーザの作品
 */
export function HomeNewUsersSection(props: Props) {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-semibold">新規クリエイター</h2>
      {props.users.map((user) => (
        <div key={user.id} className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              className="rounded-full"
              src={IconUrl(user.iconUrl)}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
          <Link
            to={`/users/${user.login}`}
            className="flex items-center space-x-2"
          >
            <div className="font-semibold text-md">{user.name}</div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export const HomeNewPostedUsersFragment = graphql(
  `fragment HomeNewPostedUsers on UserNode @_unmask {
    id
    iconUrl
    name
    login
  }`,
)
