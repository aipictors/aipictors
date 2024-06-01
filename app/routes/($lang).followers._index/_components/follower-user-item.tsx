import { FollowButton } from "@/_components/button/follow-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/_components/ui/avatar"

type Props = {
  userId: string
  userName: string
  userIconImageURL: string | null
  biography: string
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
  }[]
  isFollow: boolean
}

export const FollowerUserItem = (props: Props) => {
  const MAX_LENGTH = 40 // Set your desired maximum length

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`
    }
    return text
  }

  return (
    <div className="flex">
      <div className="mr-4 flex">
        <a href={`/users/${props.userId}`}>
          <Avatar className="mt-2 mr-2">
            <AvatarImage
              src={props.userIconImageURL ?? ""}
              alt={props.userName}
            />
            <AvatarFallback />
          </Avatar>
        </a>
        <div className="w-48">
          <p className="mb-1 font-bold text-md">{props.userName}</p>
          <p className="mb-2 text-sm opacity-80">
            {truncateText(props.biography, MAX_LENGTH)}
          </p>
          <div className="mb-2">
            <FollowButton
              targetUserId={props.userId}
              isFollow={props.isFollow}
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {props.works.map((work, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <a href={`/works/${work.id}`} key={index}>
            <div className="h-32 w-32 rounded-md">
              <img
                className="h-32 w-32 object-cover"
                alt={work.title}
                key={work.id}
                src={work.thumbnailImageUrl}
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
