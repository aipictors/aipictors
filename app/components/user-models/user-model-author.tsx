import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { UserModelAuthor as Author } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  userId: string
  user?: Author | null
  size?: "sm" | "md"
  /**
   * カード内などリンクを入れ子にできない場所では false
   */
  linked?: boolean
  className?: string
}

/**
 * モデルの作者（API に user が無ければ GraphQL で補完）
 */
export function UserModelAuthor(props: Props) {
  const { data } = useQuery(userModelAuthorQuery, {
    variables: { id: props.userId },
    skip: Boolean(props.user) || !props.userId,
    fetchPolicy: "cache-first",
  })

  const user = props.user ?? data?.user ?? null
  const name = user?.name ?? "…"
  const iconSize = props.size === "md" ? "size-8" : "size-5"

  const content = (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        props.size === "md" ? "text-sm" : "text-xs",
        props.className,
      )}
    >
      <img
        src={withIconUrlFallback(user?.iconUrl)}
        alt=""
        className={cn(iconSize, "shrink-0 rounded-full object-cover")}
        loading="lazy"
      />
      <span className="truncate">{name}</span>
    </span>
  )

  if (props.linked && user?.login) {
    return (
      <Link to={`/users/${user.login}`} className="min-w-0 hover:underline">
        {content}
      </Link>
    )
  }

  return content
}

const userModelAuthorQuery = graphql(
  `query UserModelAuthor($id: ID!) {
    user(id: $id) {
      id
      login
      name
      iconUrl
    }
  }`,
)
