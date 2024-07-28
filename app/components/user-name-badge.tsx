import { IconUrl } from "@/components/icon-url"
import { Link } from "@remix-run/react"

type Props = {
  userId: string
  name: string
  userIconImageURL?: string
  width: "sm" | "md" | "lg"
  padding?: "sm" | "md" | "lg"
}

/**
 * ユーザネームとアイコンを表示するコンポーネント
 */
export const UserNameBadge = (props: Props) => {
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

  return (
    <Link
      to={`/users/${props.userId}`}
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`flex items-center space-x-2 text-ellipsis overflow-hidden ${width()} ${padding()}`}
    >
      <img
        alt="user icon"
        className="h-4 w-4 rounded-full"
        src={IconUrl(props.userIconImageURL)}
      />
      <p
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`text-ellipsis overflow-hidden text-nowrap text-xs ${width()}`}
      >
        {props.name}
      </p>
    </Link>
  )
}
