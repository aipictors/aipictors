import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { HomeEventBanner } from "~/routes/($lang)._main._index/components/home-event-banner"
import {
  HomeGenerationBanner,
  type homeGenerationBannerWorkFieldFragment,
} from "~/routes/($lang)._main._index/components/home-generation-banner"
import type { FragmentOf } from "gql.tada"

type Props = {
  adWorks: FragmentOf<typeof homeGenerationBannerWorkFieldFragment>[]
}

/**
 * ホームのバナー
 */
export const HomeBanners = (props: Props) => {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent className="m-auto">
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