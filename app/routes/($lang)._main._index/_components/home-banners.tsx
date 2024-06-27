import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/_components/ui/carousel"
import { HomeEventBanner } from "@/routes/($lang)._main._index/_components/home-event-banner"
import { HomeGenerationBanner } from "@/routes/($lang)._main._index/_components/home-generation-banner"
import type { homeQuery } from "@/routes/($lang)._main._index/_graphql/home-query"
import type { ResultOf } from "gql.tada"

type Props = {
  adWorks: NonNullable<ResultOf<typeof homeQuery>["adWorks"]>
}

/**
 * ホームのバナー
 */
export const HomeBanners = (props: Props) => {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent className="m-auto max-w-[1200px]">
        <CarouselItem className="basis-1/1 pl-0 xl:basis-1/2">
          <HomeGenerationBanner works={props.adWorks} />
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
