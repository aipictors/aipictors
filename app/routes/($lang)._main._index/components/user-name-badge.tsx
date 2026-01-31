import { Link } from "@remix-run/react"
import { Heart } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  userId: string
  name: string
  userIconImageURL?: string
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
        <div className="flex items-center space-x-2">
          <Avatar
            className={cn("rounded-full", {
              "size-4": props.width === "sm",
              "size-6": props.width === "md",
              "size-8": props.width === "lg",
            })}
          >
            <AvatarImage
              className={cn("rounded-full", {
                "size-4": props.width === "sm",
                "size-6": props.width === "md",
                "size-8": props.width === "lg",
              })}
              src={withIconUrlFallback(props.userIconImageURL)}
              alt="user icon"
            />
            <AvatarFallback />
          </Avatar>
          <p
            className={cn("overflow-hidden text-ellipsis text-nowrap", {
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
          <div className="ml-auto items-center">
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
