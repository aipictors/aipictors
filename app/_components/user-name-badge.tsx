type Props = {
  userId: string
  name: string
  userIconImageURL?: string
  width: "sm" | "md" | "lg"
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

  return (
    <a
      href={`/users/${props.userId}`}
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`flex items-center space-x-2 text-ellipsis overflow-hidden ${width()}`}
    >
      <img
        alt="user icon"
        className="h-4 w-4 rounded-full"
        src={
          props.userIconImageURL ??
          "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg"
        }
      />
      <p
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`text-ellipsis overflow-hidden text-nowrap text-xs ${width()}`}
      >
        {props.name}
      </p>
    </a>
  )
}
