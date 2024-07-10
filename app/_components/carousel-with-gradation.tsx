import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/_components/ui/carousel"

type Props = {
  items: React.ReactNode[]
}

/**
 * グラデーション付きカルーセル
 */
export const CarouselWithGradation = (props: Props) => {
  if (props.items.length === 0) {
    return null
  }

  return (
    <>
      <Carousel opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          <CarouselItem className="relative w-4 basis-1/3.5 space-y-2" />
          {props.items.map((item) => (
            // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
            <CarouselItem className="relative basis-1/3.5 space-y-2">
              {item}
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
          <div className="relative basis-1/3.5 space-y-2" />
        </CarouselContent>
        <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-card dark:to-transparent" />
        <CarouselPrevious className="absolute left-0" />
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-card" />
        <CarouselNext className="absolute right-0" />
      </Carousel>
    </>
  )
}
