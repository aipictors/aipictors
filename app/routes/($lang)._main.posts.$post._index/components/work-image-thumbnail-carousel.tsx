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

export function WorkImageThumbnailCarousel ({
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
        <div className="rounded-none bg-zinc-100 text-center dark:bg-zinc-900">
          <p className="m-auto text-center text-sm opacity-50">
            {currentIndex + 1} / {allImageURLs.length}
          </p>
        </div>
      )}
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent className="ml-0">
          {allImageURLs.map((imageURL, index) => {
            // 選択された画像かどうかを判定し、対応するスタイルを適用
            const isSelected = imageURL === selectedImage
            const frameClassName = isSelected
              ? "group relative flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-clear-bright-blue bg-zinc-100 transition-colors dark:bg-zinc-900"
              : "group relative flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-transparent bg-zinc-100 transition-colors hover:border-zinc-300 dark:bg-zinc-900 dark:hover:border-zinc-700"

            return (
              <CarouselItem
                // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
                key={index}
                className="basis-[6.5rem] pl-1 sm:basis-[7.5rem] md:basis-[8.5rem]"
              >
                <button
                  type="button"
                  className={frameClassName}
                  onClick={() => onSelectImage(imageURL)}
                  onKeyUp={(event) => handleKeyPress(imageURL, event)}
                >
                  <img
                    className="h-full w-full object-contain"
                    alt=""
                    key={imageURL}
                    src={imageURL}
                    loading="lazy"
                  />
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {/* <div className="absolute top-0 left-0 h-full w-16 bg-linear-to-r from-card to-transparent" /> */}
        <CarouselPrevious className="absolute left-0" />
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-linear-to-r from-transparent to-card" /> */}
        <CarouselNext className="absolute right-0" />
      </Carousel>
    </div>
  )
}
