import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/_components/ui/carousel"
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
          const imageClassName = isSelected
            ? "w-40 h-16 cursor-pointer object-cover border-2 border-clear-bright-blue m-auto"
            : "w-40 h-16 cursor-pointer object-cover border-2 border-transparent m-auto"

          return (
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className={"basis-1/3"}
            >
              <img
                className={imageClassName}
                alt=""
                key={imageURL}
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
      <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-card dark:to-transparent" />
      <CarouselPrevious className="absolute left-0" />
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-card" />
      <CarouselNext className="absolute right-0" />
    </Carousel>
  )
}
