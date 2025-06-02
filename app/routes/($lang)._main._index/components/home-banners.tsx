import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
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
  const banners = [
    {
      href: "https://www.aipictors.com/events/2025-event-rainbow",
      src: "https://assets.aipictors.com/rainbow-banner-2025.webp",
    },
    {
      href: "/generation",
      src: "https://assets.aipictors.com/home_banner_02.webp",
    },
    {
      href: "https://docs.google.com/forms/d/e/1FAIpQLSfyDAMllfLp8PyKJFEFhm8K7bQnSm0Nc066opKcoSp130_gkg/viewform?usp=pp_url",
      src: "https://assets.aipictors.com/home_banner_03.webp",
      blank: true,
    },
  ]

  return (
    <Carousel opts={{ dragFree: true, loop: true, align: "start" }}>
      <CarouselContent className="flex gap-x-4">
        {banners.map(({ href, src, blank }, i) => (
          <CarouselItem key={i.toString()} className="flex-none">
            <Link to={href} target={blank ? "_blank" : undefined}>
              <img
                src={src}
                alt={`home_banner_${i + 1}`}
                className="h-40 w-auto md:h-48"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* ナビゲーションボタン */}
      <CarouselPrevious className="-translate-y-1/2 absolute top-1/2 left-0" />
      <CarouselNext className="-translate-y-1/2 absolute top-1/2 right-0" />
    </Carousel>
  )
}

export const HomeBannerWorkFragment = graphql(
  `fragment HomeBannerWork on WorkNode {
    ...HomeGenerationBannerWork
  }`,
  [HomeGenerationBannerWorkFragment],
)
