import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { RenderPhotoProps } from "react-photo-album"
import { generateBase64Blur } from "../_utils/generate-blur-image" // 適切なパスに修正してください

type HomeWorkAlbumProps = RenderPhotoProps & {
  workId: string
}

export default function HomeWorkAlbum({
  photo,
  wrapperStyle,
  workId,
}: HomeWorkAlbumProps) {
  const [blurDataURL, setBlurDataURL] = useState<string>("") // blurDataURLの状態を管理

  useEffect(() => {
    // photo.srcが変わるたびにボカシ効果のbase64データを生成
    generateBase64Blur(photo.src).then(setBlurDataURL).catch(console.error)
  }, [photo.src]) // 依存配列にphoto.srcを設定

  return (
    <div style={{ ...wrapperStyle, position: "relative" }}>
      <Link href={`/works/${workId}`}>
        <Image
          fill
          src={photo.src}
          placeholder="blur" // ボカシプレースホルダーを有効化
          blurDataURL={blurDataURL} // 生成されたボカシ効果のbase64データ
          {...{
            alt: "",
            className: "rounded",
          }}
        />
      </Link>
    </div>
  )
}
