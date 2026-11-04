import { Link } from "~/lib/app/locale-router"
import { Heart } from "lucide-react"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { cn } from "~/lib/utils"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  userId: string
  name: string
  userIconImageURL?: string
  frame?: UserAvatarFramePresentation | null
  width: "sm" | "md" | "lg"
  padding?: "sm" | "md" | "lg"
  likesCount?: number
  snapshotLikedCount?: number
}

/**
 * ユーザネームとアイコンを表示するコンポーネント
 */
export function UserNameBadge (props: Props) {
  return (
    <Link
      className="flex max-w-40 flex-col gap-y-2"
      to={`/users/${props.userId}`}
    >
      <div
        className={cn("flex items-center overflow-hidden text-ellipsis", {
          "p-1": props.padding === "sm",
          "p-2": props.padding === "md",
          "p-3": props.padding === "lg",
        })}
      >
        {/* 名前が長くても、いいね数が枠の外に押し出されないように名前の側を縮める */}
        <div className="flex min-w-0 items-center space-x-2">
          <UserAvatarWithFrame
            alt={props.name}
            frame={props.frame}
            isAnimated={false}
            sizeClassName={cn("shrink-0 rounded-full", {
              "size-4": props.width === "sm",
              "size-6": props.width === "md",
              "size-8": props.width === "lg",
            })}
            src={withIconUrlFallback(props.userIconImageURL)}
          />
          <p
            className={cn("min-w-0 overflow-hidden text-ellipsis text-nowrap", {
              "max-w-16 text-xs":
                props.width === "sm" && props.snapshotLikedCount,
              "max-w-20 text-xs":
                props.width === "sm" && !props.snapshotLikedCount,
              "max-w-14 text-sm":
                props.width === "md" && props.snapshotLikedCount,
              "max-w-32 text-sm":
                props.width === "md" && !props.snapshotLikedCount,
              "max-w-40 text-base": props.width === "lg",
            })}
          >
            {props.name}
          </p>
        </div>
        {props.likesCount !== undefined && (
          <div className="ml-auto shrink-0 items-center pl-1">
            <div className="flex items-center space-x-1">
              <Heart className="size-3 fill-gray-400 text-gray-400" />
              <span className="text-xs">{props.likesCount}</span>
              {props.snapshotLikedCount && (
                <span className="text-xs opacity-80">
                  ({props.snapshotLikedCount})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
