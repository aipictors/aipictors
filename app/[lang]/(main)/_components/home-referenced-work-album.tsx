import { Link } from "@remix-run/react"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
  workId: string
}

export default function HomeReferencedWorkAlbum({
  photo,
  wrapperStyle,
  workId, // workId を引数として受け取る
}: HomeWorkAlbumProps) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link to={`/generation?reference=${workId}`}>
        <img
          src={photo.src}
          placeholder={"blurDataURL" in photo ? "blur" : undefined}
          alt={""}
          className={"rounded"}
        />
      </Link>
    </div>
  )
}
