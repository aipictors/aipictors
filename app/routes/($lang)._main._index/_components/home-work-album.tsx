import { LikeButton } from "@/_components/like-button"
import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
  workId: string
  workOwnerUserId: string
}

export function HomeWorkAlbum({
  photo,
  wrapperStyle,
  workId,
  workOwnerUserId,
}: HomeWorkAlbumProps) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link to={`/works/${workId}`}>
        <img
          src={photo.src}
          // @ts-ignore
          placeholder={"blurDataURL" in photo ? "blur" : ""}
          alt={""}
          className={"rounded"}
        />
      </Link>
      <div className="absolute right-1 bottom-1">
        <LikeButton
          size={56}
          targetWorkId={workId}
          targetWorkOwnerUserId={workOwnerUserId}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
        />
      </div>
    </div>
  )
}
