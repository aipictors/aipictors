import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { HomeGenerationBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-generation-banner"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"

type Props = {
  works: FragmentOf<typeof HomeBannerWorkFragment>[]
}

/**
 * ホームのバナー
 */
export function HomeBanners(props: Props) {
  const works = props.works.map((work) => {
    return readFragment(HomeBannerWorkFragment, work)
  })

  return (
    <Carousel opts={{ dragFree: true, loop: true }}>
      <CarouselContent className="m-auto">
        <CarouselItem className="basis-1/1 pl-0 xl:basis-1/1">
          <Link to="/contributors">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-64 md:max-h-auto"
              src="https://assets.aipictors.com/home_banner_01.webp"
            />
          </Link>
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/1">
          <Link to="/generation">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-64 md:max-h-auto"
              src="https://assets.aipictors.com/home_banner_02.webp"
            />
          </Link>
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/1">
          <Link to="/events/halloween-2024">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-64 md:max-h-auto"
              src="https://assets.aipictors.com/wakiaiai-3-halloween-2024-home-banner.webp"
            />
          </Link>
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/1">
          <Link to="/">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-64 md:max-h-auto"
              src="https://assets.aipictors.com/home_banner_03.webp"
            />
          </Link>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}

export const HomeBannerWorkFragment = graphql(
  `fragment HomeBannerWork on WorkNode {
    ...HomeGenerationBannerWork
  }`,
  [HomeGenerationBannerWorkFragment],
)
