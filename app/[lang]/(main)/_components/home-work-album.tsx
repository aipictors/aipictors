import Image from "next/image"
import Link from "next/link"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
  workId: string
}

export default function HomeWorkAlbum({
  photo,
  wrapperStyle,
  workId, // workId を引数として受け取る
}: HomeWorkAlbumProps) {
  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link href={`/works/${workId}`}>
        <Image className="rounded" alt="" fill src={photo.src} />
      </Link>
    </div>
  )
}
