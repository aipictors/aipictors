import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  name: string
  iconUrl: string | null
  login: string
}

/**
 * 作品にいいねしたユーザ
 */
export function WorkLikedUser(props: Props) {
  return (
    <Link to={`/users/${props.login}`}>
      <Card className="p-4">
        <div className="flex max-h-16 flex-col space-y-1">
          <Avatar className="m-auto">
            <AvatarImage
              src={withIconUrlFallback(props.iconUrl)}
              alt={props.name}
            />
          </Avatar>
          <span className="max-w-12 overflow-hidden text-ellipsis">
            {props.name}
          </span>
        </div>
      </Card>
    </Link>
  )
}
