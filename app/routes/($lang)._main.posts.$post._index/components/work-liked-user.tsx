import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

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
              src={ExchangeIconUrl(props.iconUrl)}
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
