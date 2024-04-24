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

  const [selectedImage, setSelectedImage] = useState<string>(allImageURLs[0])

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setSelectedImage(imageURL)
    setSelectedImageIndex(allImageURLs.indexOf(imageURL))
  }

  useEffect(() => {
    setSelectedImage(allImageURLs[0])
    setSelectedImageIndex(0)
  }, [workImageURL])

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div>
        <ImagesPreview
          initIndex={selectedImageIndex}
          thumbnailUrl={selectedImage}
          imageURLs={allImageURLs}
        />
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
      <div className="relative m-0 bg-gray-100 dark:bg-zinc-950">
        <ImagesPreview
          initIndex={0}
          imageClassName="m-auto h-auto w-auto object-contain xl:max-h-[80vh]"
          thumbnailUrl={workImageURL}
          imageURLs={[workImageURL]}
        />
      </div>
    )
  }

  return null
}
