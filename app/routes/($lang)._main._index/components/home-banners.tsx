import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { HomeEventBanner } from "~/routes/($lang)._main._index/components/home-event-banner"
import {
  HomeGenerationBanner,
  type HomeGenerationBannerWorkFragment,
} from "~/routes/($lang)._main._index/components/home-generation-banner"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof HomeGenerationBannerWorkFragment>[]
}

/**
 * ホームのバナー
 */
export function HomeBanners(props: Props) {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent className="m-auto">
        <CarouselItem className="basis-1/1 pl-0 xl:basis-1/2">
          <HomeGenerationBanner works={props.works} />
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/2">
          <HomeEventBanner />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
