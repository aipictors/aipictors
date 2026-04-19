import { Card } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  name: string
  iconUrl: string | null
  login: string
  avatarFrame?: UserAvatarFramePresentation | null
}

/**
 * 作品にいいねしたユーザ
 */
export function WorkLikedUser (props: Props) {
  return (
    <Link to={`/users/${props.login}`}>
      <Card className="p-4">
        <div className="flex max-h-16 flex-col space-y-1">
          <UserAvatarWithFrame
            alt={props.name}
            frame={props.avatarFrame}
            isAnimated={false}
            frameClassName="m-auto"
            sizeClassName="size-10"
            src={withIconUrlFallback(props.iconUrl)}
          />
          <span className="max-w-12 overflow-hidden text-ellipsis">
            {props.name}
          </span>
        </div>
      </Card>
    </Link>
  )
}
