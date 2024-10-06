import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"

type Props = {
  thumbnailImageURL: string
  userId: string
  userName: string
  userIconURL: string
  collectionName: string
  collectionDescription: string
  isFollow: boolean
  login: string
  workCount: number
  tags: string[]
}

export function CollectionHeader(props: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md">
      <div className="relative h-56 w-full">
        <img
          src={props.thumbnailImageURL}
          alt="コレクションの画像"
          className="h-full w-full object-cover"
        />
        <div className="absolute right-0 bottom-0 left-0 rounded-md bg-gradient-to-t from-black to-transparent p-4">
          <h2 className="font-bold text-2xl text-white">
            {props.collectionName}
          </h2>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center space-x-4"
            to={`/users/${props.login}`}
          >
            <Avatar className="cursor-pointer">
              <AvatarImage src={props.userIconURL ?? undefined} />
              <AvatarFallback />
            </Avatar>
            <p className="font-semibold text-lg">{props.userName}</p>
          </Link>
          {/* <FollowButton targetUserId={props.userId} isFollow={props.isFollow} /> */}
        </div>
        <p className="">{props.collectionDescription}</p>
        <div className="flex items-center justify-between text-sm">
          <p>{`${props.workCount}個の作品`}</p>
        </div>
        <div className="flex gap-x-2 gap-y-2">
          {props.tags.map((tag) => (
            <Link
              className="m-0"
              key={tag}
              to={`https://www.aipictors.com/search?word=${tag}`}
            >
              <Button className="m-0 p-0" variant={"link"}>
                {tag}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
