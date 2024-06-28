import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
  userId: string
  userName: string
  userIcon: string
  workId: string
  workTitle: string
  workOwnerUserId: string
  isLiked: boolean
  isMosaic?: boolean
}

export function HomeWorkAlbum({
  photo,
  wrapperStyle,
  userId,
  userName,
  userIcon,
  workId,
  workTitle,
  workOwnerUserId,
  isLiked,
  isMosaic,
}: HomeWorkAlbumProps) {
  return (
    <div
      className="overflow-hidden transition-all hover:opacity-80"
      style={{ ...wrapperStyle, position: "relative" }}
    >
      <Link to={`/works/${workId}`}>
        <img
          style={{ filter: isMosaic ? "blur(24px)" : "none" }}
          src={photo.src}
          // @ts-ignore
          placeholder={"blurDataURL" in photo ? "blur" : ""}
          alt={""}
          className={"rounded"}
        />
      </Link>
      <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 max-h-full flex-col justify-end rounded bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88">
        <Link className="w-48 font-bold" to={`/works/${workId}`}>
          <p className="overflow-hidden text-ellipsis text-nowrap text-white text-xs">
            {workTitle}
          </p>
        </Link>
        <Link to={`/users/${userId}`}>
          <div className="flex items-center space-x-2">
            <img
              src={IconUrl(userIcon)}
              alt=""
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
    </div>
  )
}
