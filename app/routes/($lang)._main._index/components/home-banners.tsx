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

export const HomeBannerWorkFragment = graphql(
  `fragment HomeBannerWork on WorkNode {
    ...HomeGenerationBannerWork
  }`,
  [HomeGenerationBannerWorkFragment],
)

export const HomeOngoingEventFragment = graphql(
  `fragment HomeOngoingEvent on AppEventNode {
    id
    title
    slug
    thumbnailImageUrl
    startAt
    endAt
  }`,
)

type Banner = {
  href: string
  src: string
  title?: string
  blank?: boolean
}

type EventData = {
  id: string
  title: string
  slug: string
  thumbnailImageUrl: string
  startAt: number
  endAt: number
}

type Props = {
  works: FragmentOf<typeof HomeBannerWorkFragment>[]
  ongoingEvents?: EventData[]
  onSelect?: (index: string) => void
}

/**
 * ホームのバナー
 */
export function HomeBanners(props: Props) {
  console.log("props.ongoingEvents:", props.ongoingEvents)

  // 既存の固定バナー
  const staticBanners: Banner[] = [
    {
      href: "/events/2026-uma",
      src: "https://files.aipictors.com/01d55891-cbc7-4696-a152-f228c3889b12",
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

  const banners = [...staticBanners]

  return (
    <Carousel opts={{ dragFree: true, loop: true, align: "start" }}>
      <CarouselContent className="flex gap-x-4">
        {props.ongoingEvents?.map((event) => (
          <CarouselItem
            key={`event-${event.id}`}
            className="flex-none basis-auto"
          >
            {props.onSelect ? (
              <button
                type="button"
                className="relative block overflow-hidden rounded"
                onClick={() => props.onSelect?.(`event-${event.id}`)}
              >
                <img
                  src={event.thumbnailImageUrl}
                  alt={event.title}
                  className="h-40 w-auto rounded object-cover md:h-48"
                  onError={() => {
                    console.error(
                      `Failed to load event banner image: ${event.thumbnailImageUrl}`,
                    )
                    console.error("Event data:", event)
                  }}
                />
              </button>
            ) : (
              <Link to={`/events/${event.slug}`} className="relative block">
                <img
                  src={event.thumbnailImageUrl}
                  alt={event.title}
                  className="h-40 w-auto rounded object-cover md:h-48"
                  onError={() => {
                    console.error(
                      `Failed to load event banner image: ${event.thumbnailImageUrl}`,
                    )
                    console.error("Event data:", event)
                  }}
                />
              </Link>
            )}
          </CarouselItem>
        ))}
        {/* 固定バナー */}
        {banners.map((banner, i) => (
          <CarouselItem key={i.toString()} className="flex-none basis-auto">
            {props.onSelect ? (
              <button
                type="button"
                className="relative block overflow-hidden rounded"
                onClick={() => props.onSelect?.(i.toString())}
              >
                <img
                  src={banner.src}
                  alt={banner.title || `home_banner_${i + 1}`}
                  className="h-40 w-auto rounded object-cover md:h-48"
                  onError={() => {
                    console.error(`Failed to load banner image: ${banner.src}`)
                    console.error("Banner data:", banner)
                  }}
                />
              </button>
            ) : (
              <Link
                to={banner.href}
                target={banner.blank ? "_blank" : undefined}
                className="relative block"
              >
                <img
                  src={banner.src}
                  alt={banner.title || `home_banner_${i + 1}`}
                  className="h-40 w-auto rounded object-cover md:h-48"
                  onError={() => {
                    console.error(`Failed to load banner image: ${banner.src}`)
                    console.error("Banner data:", banner)
                  }}
                />
              </Link>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* ナビゲーションボタン */}
      <CarouselPrevious className="-translate-y-1/2 absolute top-1/2 left-0" />
      <CarouselNext className="-translate-y-1/2 absolute top-1/2 right-0" />
    </Carousel>
  )
}
