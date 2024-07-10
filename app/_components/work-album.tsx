import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"

type WorkAlbumProps = RenderPhotoProps & {
  userId: string
  userName: string
  userIcon: string
  workId: string
  workOwnerUserId: string
  isLiked: boolean
  isShowLikeButton?: boolean
}

export function WorkAlbum({
  photo,
  wrapperStyle,
  userId,
  userName,
  userIcon,
  workId,
  workOwnerUserId,
  isLiked,
  isShowLikeButton = true,
}: WorkAlbumProps) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link to={`/posts/${workId}`}>
        <img
          src={photo.src}
          // @ts-ignore
          placeholder={"blurDataURL" in photo ? "blur" : ""}
          alt={""}
          className={"rounded"}
        />
      </Link>
      <div className="absolute right-0 bottom-0 left-0 box-border flex h-8 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
        <Link to={`/users/${userId}`}>
          <div className="flex items-center space-x-2">
            <img
              src={IconUrl(userIcon)}
              alt=""
              className="h-4 w-4 rounded-full"
            />
            <span className="text-sm text-white">{userName}</span>
          </div>
        </Link>
      </div>
      {isShowLikeButton && (
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
      )}
    </div>
  )
}
