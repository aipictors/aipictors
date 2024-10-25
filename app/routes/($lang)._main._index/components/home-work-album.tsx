import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

type Props = RenderPhotoProps & {
  src: string
  userId: string
  userName: string
  userIcon: string
  workId: string
  workTitle: string
  workOwnerUserId: string
  isLiked: boolean
  isMosaic?: boolean
  subWorksCount?: number
}

export function HomeWorkAlbum(props: Props) {
  return (
    <div
      className="cursor overflow-hidden rounded transition-all"
      style={{ position: "relative" }}
    >
      <Link to={`/posts/${props.workId}`} className="group">
        <img
          src={props.src}
          alt={props.workTitle}
          className="rounded transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 max-h-full flex-col justify-end space-y-2 rounded bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88">
        <Link className="w-48 font-bold" to={`/posts/${props.workId}`}>
          <p className="overflow-hidden text-ellipsis text-nowrap text-white text-xs">
            {props.workTitle}
          </p>
        </Link>
        <Link to={`/users/${props.userId}`}>
          <div className="flex items-center space-x-2">
            <Avatar className="h-4 w-4 rounded-full">
              <AvatarImage
                className="h-4 w-4 rounded-full"
                src={withIconUrlFallback(props.userIcon)}
                alt={props.userName}
              />
              <AvatarFallback />
            </Avatar>
            <span className="text-nowrap font-bold text-sm text-white">
              {props.userName}
            </span>
          </div>
        </Link>
      </div>
      <div className="absolute right-1 bottom-1">
        <LikeButton
          size={56}
          targetWorkId={props.workId}
          targetWorkOwnerUserId={props.workOwnerUserId}
          defaultLiked={props.isLiked}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
      {props.subWorksCount !== undefined && props.subWorksCount !== 0 && (
        <div
          className={
            "absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-tr rounded-bl font-bold text-white text-xs"
          }
          style={{ backgroundColor: "#00000052" }}
        >
          {props.subWorksCount + 1}
        </div>
      )}
    </div>
  )
}
