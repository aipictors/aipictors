import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import React from "react"

type WorkImageThumbnailCarouselProps = {
  allImageURLs: string[]
  selectedImage: string
  onSelectImage: (imageURL: string) => void
}

export const WorkImageThumbnailCarousel: React.FC<
  WorkImageThumbnailCarouselProps
> = ({ allImageURLs, selectedImage, onSelectImage }) => {
  // 画像の枚数からbasisの分母を計算する関数
  const getBasisClassName = (totalImages: number): string => {
    const basisXlValue = totalImages
    const basisLgValue = totalImages - 1 // 画像の枚数から2を引く
    return `lg:basis-1/${basisLgValue} xl:basis-1/${basisXlValue}` // Tailwind CSSのbasisクラス名を生成
  }

  // キーボードイベントハンドラー
  const handleKeyPress = (imageURL: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSelectImage(imageURL)
    }
  }

  // 画像の枚数に基づいてbasisクラス名を取得
  const basisClassName = getBasisClassName(allImageURLs.length)

  return (
    <Carousel opts={{ dragFree: true }}>
      <CarouselContent>
        {allImageURLs.map((imageURL, index) => {
          // 選択された画像かどうかを判定し、対応するスタイルを適用
          const isSelected = imageURL === selectedImage
          const imageClassName = `w-auto h-auto object-contain rounded cursor-pointer ${
            isSelected ? "border-4" : ""
          }`

          return (
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className={`${basisClassName} ${
                isSelected ? "selected-style" : ""
              }`}
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
