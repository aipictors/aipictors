import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
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

export function HomeWorkAlbum({
  src,
  userId,
  userName,
  userIcon,
  workId,
  workTitle,
  workOwnerUserId,
  isLiked,
  subWorksCount,
}: HomeWorkAlbumProps) {
  return (
    <div
      className="cursor overflow-hidden rounded transition-all"
      style={{ position: "relative" }}
    >
      <Link to={`/posts/${workId}`} className="group">
        <img
          src={src}
          alt={workTitle}
          className="rounded transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 max-h-full flex-col justify-end space-y-2 rounded bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88">
        <Link className="w-48 font-bold" to={`/posts/${workId}`}>
          <p className="overflow-hidden text-ellipsis text-nowrap text-white text-xs">
            {workTitle}
          </p>
        </Link>
        <Link to={`/users/${userId}`}>
          <div className="flex items-center space-x-2">
            <img
              src={IconUrl(userIcon)}
              alt={userName}
              className="h-4 w-4 rounded-full"
            />
            <span className="text-nowrap font-bold text-sm text-white">
              {userName}
            </span>
          </div>
        </Link>
      </div>
      <div className="absolute right-1 bottom-1">
        <LikeButton
          size={56}
          targetWorkId={workId}
          targetWorkOwnerUserId={workOwnerUserId}
          defaultLiked={isLiked}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
      {subWorksCount !== undefined && subWorksCount !== 0 && (
        <div
          className={
            "absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-tr rounded-bl font-bold text-white text-xs"
          }
          style={{ backgroundColor: "#00000052" }}
        >
          {subWorksCount + 1}
        </div>
      )}
    </div>
  )
}
