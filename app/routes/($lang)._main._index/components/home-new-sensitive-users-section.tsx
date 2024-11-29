import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  users: FragmentOf<typeof HomeNewPostedUsersFragment>[]
}

/**
 * 新規ユーザ一覧
 */
export function HomeNewSensitiveUsersSection(props: Props) {
  const t = useTranslation()

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="font-semibold">{t("新規クリエイター", "New Creators")}</h2>
      {props.users.map((user) => (
        <div key={user.id} className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage
              className="rounded-full"
              src={withIconUrlFallback(user.iconUrl)}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
          <Link
            to={`/r/users/${user.login}`}
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
