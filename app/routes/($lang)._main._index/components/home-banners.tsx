import { Link } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { HomeGenerationBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-generation-banner"

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
          <Link to="https://www.aipictors.com/events/spring">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-48 md:max-h-auto"
              src="https://assets.aipictors.com/spring-event.webp"
            />
          </Link>
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/1">
          <Link to="/generation">
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-48 md:max-h-auto"
              src="https://assets.aipictors.com/home_banner_02.webp"
            />
          </Link>
        </CarouselItem>
        <CarouselItem className="basis-1/1 xl:basis-1/1">
          <Link
            target="_blank"
            to="https://docs.google.com/forms/d/e/1FAIpQLSfyDAMllfLp8PyKJFEFhm8K7bQnSm0Nc066opKcoSp130_gkg/viewform?usp=pp_url"
          >
            <img
              alt="home_banner_01"
              className="h-40 w-auto md:h-48 md:max-h-auto"
              src="https://assets.aipictors.com/home_banner_03.webp"
            />
          </Link>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="absolute top-1/2 left-0" />
      <CarouselNext className="absolute top-1/2 right-0" />
    </Carousel>
  )
}

export const HomeBannerWorkFragment = graphql(
  `fragment HomeBannerWork on WorkNode {
    ...HomeGenerationBannerWork
  }`,
  [HomeGenerationBannerWorkFragment],
)
