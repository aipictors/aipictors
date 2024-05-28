import { Avatar, AvatarImage, AvatarFallback } from "@/_components/ui/avatar"

type Props = {
  userName: string
  userIconImageURL: string | null
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
  }[]
}

export const FollowingUserItem = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <Avatar>
          <AvatarImage
            src={props.userIconImageURL ?? ""}
            alt={props.userName}
          />
          <AvatarFallback />
        </Avatar>
        <p>{props.userName}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {props.works.map((work) => (
          <img alt={work.title} key={work.id} src={work.thumbnailImageUrl} />
        ))}
      </div>
    </div>
  )
}
