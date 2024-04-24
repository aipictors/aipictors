import { WorkImageThumbnailCarousel } from "@/routes/($lang)._main.works.$work/_components/work-image-thumbnail-carousel"
import { PhotoView } from "react-photo-view"
import type React from "react"
import { useState } from "react"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export const WorkImageView = ({ workImageURL, subWorkImageURLs }: Props) => {
  const allImageURLs = workImageURL
    ? [workImageURL, ...subWorkImageURLs]
    : subWorkImageURLs
  const shouldRenderCarousel = allImageURLs.length > 1

  const [selectedImage, setSelectedImage] = useState<string>(allImageURLs[0])

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setSelectedImage(imageURL)
  }

  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSelectImage(imageURL)
    }
  }

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div>
        {allImageURLs.map((selectedImage, index) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <PhotoView key={index} src={selectedImage}>
            {index < 1 ? (
              <img
                className="h-full w-auto rounded bg-card object-contain xl:h-screen"
                alt=""
                src={selectedImage}
              />
            ) : undefined}
          </PhotoView>
        ))}
        <WorkImageThumbnailCarousel
          allImageURLs={allImageURLs}
          selectedImage={selectedImage}
          onSelectImage={handleSelectImage}
        />
      </div>
    )
  }

  if (workImageURL) {
    return (
      <div className="relative m-0 bg-gray-100 dark:bg-gray-900">
        <PhotoView src={workImageURL}>
          <img
            className="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
            alt=""
            src={workImageURL}
          />
        </PhotoView>
      </div>
    )
  }

  return null
}
