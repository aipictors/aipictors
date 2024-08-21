import { WorkImageThumbnailCarousel } from "~/routes/($lang)._main.posts.$post._index/components/work-image-thumbnail-carousel"
import { useEffect, useState } from "react"
import { ImagesPreview } from "~/components/images-preview"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
}

export function WorkImageView({ workImageURL, subWorkImageURLs }: Props) {
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
      <div className="flex flex-col">
        <ImagesPreview
          thumbnailUrl={allImageURLs[currentIndex]}
          imageURLs={allImageURLs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
        <WorkImageThumbnailCarousel
          allImageURLs={allImageURLs}
          selectedImage={allImageURLs[currentIndex]}
          currentIndex={currentIndex}
          onSelectImage={handleSelectImage}
        />
      </div>
    )
  }

  if (workImageURL) {
    return (
      <div className="relative m-0">
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
