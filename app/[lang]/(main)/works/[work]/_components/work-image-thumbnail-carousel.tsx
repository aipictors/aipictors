import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type React from "react"

type WorkImageThumbnailCarouselProps = {
  allImageURLs: string[]
  selectedImage: string
  onSelectImage: (imageURL: string) => void
}

export const WorkImageThumbnailCarousel: React.FC<
  WorkImageThumbnailCarouselProps
> = ({ allImageURLs, selectedImage, onSelectImage }) => {
  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSelectImage(imageURL)
    }
  }

  return (
    <Carousel opts={{ dragFree: true }}>
      <CarouselContent>
        {allImageURLs.map((imageURL, index) => {
          // 選択された画像かどうかを判定し、対応するスタイルを適用
          const isSelected = imageURL === selectedImage
          const imageClassName = `w-80 h-40 object-cover rounded cursor-pointer ${
            isSelected ? "border-4" : ""
          }`

          return (
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className={`basis-1/3${isSelected ? "selected-style" : ""}`}
            >
              <img
                className={imageClassName}
                alt=""
                src={imageURL}
                onClick={() => onSelectImage(imageURL)}
                onKeyUp={(event) => handleKeyPress(imageURL, event)}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
                tabIndex={0}
              />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="xl:invisible" />
      <CarouselNext className="xl:invisible" />
    </Carousel>
  )
}
