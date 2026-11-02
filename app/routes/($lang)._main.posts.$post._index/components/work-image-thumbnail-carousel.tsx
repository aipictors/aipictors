import type React from "react"
import { useEffect, useState } from "react"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

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
  const [api, setApi] = useState<CarouselApi>()

  // 今の画像のサムネイルが一覧の外に出ていたら見える位置まで送る
  useEffect(() => {
    if (!api || api.slidesInView().includes(currentIndex)) return
    api.scrollTo(currentIndex, true)
  }, [api, currentIndex])

  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSelectImage(imageURL)
    }
  }

  return (
    <Carousel setApi={setApi} opts={{ dragFree: true }}>
      <CarouselContent className="ml-0 py-0.5">
        {allImageURLs.map((imageURL, index) => {
          const isSelected = imageURL === selectedImage

          return (
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              key={index}
              className="basis-16 pl-1.5 md:basis-20"
            >
              <button
                type="button"
                className={cn(
                  "block aspect-square w-full cursor-pointer overflow-hidden rounded-lg bg-muted transition",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "opacity-70 hover:opacity-100",
                )}
                onClick={() => onSelectImage(imageURL)}
                onKeyUp={(event) => handleKeyPress(imageURL, event)}
                aria-label={`${index + 1} / ${allImageURLs.length}`}
                aria-pressed={isSelected}
              >
                <img
                  className="size-full object-cover object-top"
                  alt=""
                  key={imageURL}
                  // 小さな一覧なので縮小版にする（原寸は数百 KB のことがある）
                  src={toResizedImageUrl(imageURL, 160)}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="absolute left-1 hidden md:flex" />
      <CarouselNext className="absolute right-1 hidden md:flex" />
    </Carousel>
  )
}
