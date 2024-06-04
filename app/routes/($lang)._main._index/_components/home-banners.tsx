import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/_components/ui/carousel"
import { HomeEventBanner } from "@/routes/($lang)._main._index/_components/home-event-banner"
import { HomeGenerationBanner } from "@/routes/($lang)._main._index/_components/home-generation-banner"

/**
 * ホームのバナー
 */
export const HomeBanners = () => {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent>
        <CarouselItem className="basis-1/1 xl:basis-1/2">
          <HomeGenerationBanner />
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/2">
          <HomeEventBanner />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
