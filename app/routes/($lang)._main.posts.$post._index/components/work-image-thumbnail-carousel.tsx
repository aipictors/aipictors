import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import type React from "react"

type Props = {
  allImageURLs: string[]
  selectedImage: string
  currentIndex: number
  onSelectImage: (imageURL: string) => void
}

export function WorkImageThumbnailCarousel({
  allImageURLs,
  selectedImage,
  currentIndex,
  onSelectImage,
}: Props) {
  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSelectImage(imageURL)
    }
  }

  return (
    <div className="flex flex-col">
      {allImageURLs.length > 1 && (
        <div className="rounded-none bg-card bg-zinc-100 text-center dark:bg-zinc-900">
          <p className="m-auto text-center text-sm opacity-50">
            {currentIndex + 1} / {allImageURLs.length}
          </p>
        </div>
      )}
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
                className={"basis-1/8"}
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
        {/* <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-card to-transparent" /> */}
        <CarouselPrevious className="absolute left-0" />
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-card" /> */}
        <CarouselNext className="absolute right-0" />
      </Carousel>
    </div>
  )
}
