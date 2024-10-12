import { Link } from "@remix-run/react"
import { Heart } from "lucide-react"
import { cn } from "~/lib/utils"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

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
export function UserNameBadge(props: Props) {
  return (
    <Link className="flex flex-col gap-y-2" to={`/users/${props.userId}`}>
      <div
        className={cn("flex items-center overflow-hidden text-ellipsis", {
          "p-1": props.padding === "sm",
          "p-2": props.padding === "md",
          "p-3": props.padding === "lg",
        })}
      >
        <div className="flex items-center space-x-2">
          <img
            alt="user icon"
            className={cn("rounded-full", {
              "h-4 w-4": props.width === "sm",
              "h-6 w-6": props.width === "md",
              "h-8 w-8": props.width === "lg",
            })}
            src={ExchangeIconUrl(props.userIconImageURL)}
          />
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
              <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
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
