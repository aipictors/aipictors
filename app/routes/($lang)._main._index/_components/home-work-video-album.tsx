import { LikeButton } from "@/_components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"
import { useRef } from "react"
import { Badge } from "@/_components/ui/badge"
import { useMediaQuery } from "usehooks-ts"
import { config } from "@/config"
import { IconUrl } from "@/_components/icon-url"

type HomeWorkAlbumProps = RenderPhotoProps & {
  userId: string
  userName: string
  userIcon: string
  workId: string
  workTitle: string
  workOwnerUserId: string
  isLiked: boolean
  url: string
}

export function HomeWorkVideoAlbum({
  photo,
  wrapperStyle,
  userId,
  userName,
  userIcon,
  workId,
  workTitle,
  workOwnerUserId,
  isLiked,
  url,
}: HomeWorkAlbumProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.style.zIndex = "10" // 動画を前面に表示
      videoRef.current.play() // 動画を再生
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause() // 動画を停止
      videoRef.current.style.zIndex = "-1" // 動画を背面に戻す
    }
  }

  return (
    <div
      className="relative transition-all"
      style={{ ...wrapperStyle, position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link className="relative" to={`/works/${workId}`}>
        <img
          src={photo.src}
          // @ts-ignore
          placeholder={"blurDataURL" in photo ? "blur" : ""}
          alt={""}
          className={"rounded"}
        />
        {isDesktop && (
          <video
            src={url}
            ref={videoRef}
            className="absolute top-0 left-0 rounded"
            style={{ zIndex: "-1" }}
            muted
          >
            <track kind="captions" src={url} label="English" />
          </video>
        )}
        <div className="absolute top-1 left-1 opacity-50">
          <Badge variant={"secondary"} className="text-xs">
            {"video"}
          </Badge>
        </div>
      </Link>
      <div className="absolute right-0 bottom-0 left-0 box-border flex h-[16%] flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
        <Link className="w-48" to={`/works/${workId}`}>
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
            <span className="text-sm text-white">{userName}</span>
          </div>
        </Link>
      </div>
      <div className="absolute right-1 bottom-1 z-20">
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
