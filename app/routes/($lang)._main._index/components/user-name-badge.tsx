import { Link } from "@remix-run/react"
import { Heart } from "lucide-react"
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
  const width = () => {
    if (props.width === "sm") {
      return "max-w-20"
    }
    if (props.width === "md") {
      return "max-w-32"
    }

    return "max-w-40"
  }

  const padding = () => {
    if (props.padding === "sm") {
      return "p-1"
    }
    if (props.padding === "md") {
      return "p-2"
    }
    if (props.padding === "lg") {
      return "p-3"
    }
    return "p-0"
  }

  const iconWidth = () => {
    if (props.width === "sm") {
      return "h-4 w-4"
    }
    if (props.width === "md") {
      return "h-6 w-6"
    }

    return "h-8 w-8"
  }

  const nameSize = () => {
    if (props.width === "sm") {
      return "text-xs"
    }
    if (props.width === "md") {
      return "text-sm"
    }

    return "text-base"
  }

  return (
    <Link className="flex flex-col gap-y-2" to={`/users/${props.userId}`}>
      <div
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`flex items-center overflow-hidden text-ellipsis ${width()} ${padding()}`}
      >
        <div className="flex items-center space-x-2">
          <img
            alt="user icon"
            className={`rounded-full ${iconWidth()}`}
            src={ExchangeIconUrl(props.userIconImageURL)}
          />
          <p
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`text-ellipsis overflow-hidden text-nowrap ${nameSize()} ${width()}`}
          >
            {props.name}
          </p>
        </div>
      </div>
      <div>
        {props.likesCount && (
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
