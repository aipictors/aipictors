"use client"

import getBase64 from "@/lib/app/utils/get-base64"
import Image from "next/image"
import Link from "next/link"
import type { RenderPhotoProps } from "react-photo-album"

type HomeWorkAlbumProps = RenderPhotoProps & {
  workId: string
}

export default function HomeWorkAlbum({
  photo,
  wrapperStyle,
  workId,
}: HomeWorkAlbumProps) {
  const blurDataURL = getBase64({ src: photo.src })

  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link href={`/works/${workId}`}>
        <Image
          fill
          src={photo.src}
          alt=""
          placeholder={"blurDataURL" in photo ? "blur" : undefined}
          blurDataURL=""
          className="rounded"
        />
      </Link>
    </div>
  )
}
