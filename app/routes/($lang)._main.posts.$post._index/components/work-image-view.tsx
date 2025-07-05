import { WorkImageThumbnailCarousel } from "~/routes/($lang)._main.posts.$post._index/components/work-image-thumbnail-carousel"
import { useEffect, useState } from "react"
import { ImagesPreview } from "~/components/images-preview"

type Props = {
  workImageURL?: string
  subWorkImageURLs: string[]
  onSelectedImage?: (imageURL: string) => void
  mode?: "dialog" | "page"
}

export function WorkImageView(props: Props) {
  const allImageURLs = props.workImageURL
    ? [props.workImageURL, ...props.subWorkImageURLs]
    : props.subWorkImageURLs

  const shouldRenderCarousel = allImageURLs.length > 1

  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // 画像選択関数
  const handleSelectImage = (imageURL: string) => {
    setCurrentIndex(allImageURLs.indexOf(imageURL))
    if (props.onSelectedImage) {
      props.onSelectedImage(imageURL)
    }
  }

  useEffect(() => {
    setCurrentIndex(0)
  }, [props.workImageURL])

  // カルーセルのレンダリング
  if (shouldRenderCarousel) {
    return (
      <div className="flex flex-col">
        <ImagesPreview
          thumbnailUrl={allImageURLs[currentIndex]}
          imageURLs={allImageURLs}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          mode={props.mode}
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

  if (props.workImageURL) {
    return (
      <div className="relative m-0">
        <ImagesPreview
          currentIndex={0}
          setCurrentIndex={() => {}}
          thumbnailUrl={props.workImageURL}
          imageURLs={[props.workImageURL]}
          mode={props.mode}
        />
      </div>
    )
  }

  return null
}
