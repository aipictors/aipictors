import { WorkImageThumbnailCarousel } from "@/routes/($lang)._main.works.$work/_components/work-image-thumbnail-carousel"
import { useEffect, useState } from "react"
import { ImagesPreview } from "@/_components/images-preview"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export const WorkImageView = ({ workImageURL, subWorkImageURLs }: Props) => {
  const allImageURLs = workImageURL
    ? [workImageURL, ...subWorkImageURLs]
    : subWorkImageURLs

  const shouldRenderCarousel = allImageURLs.length > 1

  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setCurrentIndex(allImageURLs.indexOf(imageURL))
  }

  useEffect(() => {
    setCurrentIndex(0)
  }, [workImageURL])

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div>
        <ImagesPreview
          thumbnailUrl={allImageURLs[currentIndex]}
          imageURLs={allImageURLs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        <div className="p-2">
          <WorkImageThumbnailCarousel
            allImageURLs={allImageURLs}
            selectedImage={allImageURLs[currentIndex]}
            onSelectImage={handleSelectImage}
          />
        </div>
      </div>
    )
  }

  if (workImageURL) {
    return (
      <div className="relative m-0 bg-gray-100 dark:bg-zinc-950">
        <ImagesPreview
          currentIndex={0}
          setCurrentIndex={() => {}}
          thumbnailUrl={workImageURL}
          imageURLs={[workImageURL]}
        />
      </div>
    )
  }

  return null
}
