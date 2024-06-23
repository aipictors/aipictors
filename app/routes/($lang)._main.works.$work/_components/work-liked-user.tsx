import { IconUrl } from "@/_components/icon-url"
import { Avatar, AvatarImage } from "@/_components/ui/avatar"
import { Card } from "@/_components/ui/card"
import { Link } from "@remix-run/react"

type Props = {
  name: string
  iconUrl: string | null
  login: string
}

/**
 * 作品にいいねしたユーザ
 */
export const WorkLikedUser = (props: Props) => {
  return (
    <Link to={`/users/${props.login}`}>
      <Card className="p-4">
        <div className="flex max-h-16 flex-col space-y-1">
          <Avatar className="m-auto">
            <AvatarImage src={IconUrl(props.iconUrl)} alt={props.name} />
          </Avatar>
          <span className="max-w-12 overflow-hidden text-ellipsis">
            {props.name}
          </span>
        </div>
      </Card>
    </Link>
  )
}
