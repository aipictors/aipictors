import { Link } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
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
  // 既存の固定バナー
  const staticBanners: Banner[] = [
    {
      href: "https://forms.gle/Z4sCmFwUkXfBLaCB8",
      src: "https://assets.aipictors.com/anketaipictors.webp",
    },
    {
      href: "/events/2026-uma",
      src: "https://files.aipictors.com/01d55891-cbc7-4696-a152-f228c3889b12",
    },
    {
      href: "/generation",
      src: "https://assets.aipictors.com/Aipictors_01.webp",
      title: "Aipictors Logo",
    },
    {
      href: "https://docs.google.com/forms/d/e/1FAIpQLSfyDAMllfLp8PyKJFEFhm8K7bQnSm0Nc066opKcoSp130_gkg/viewform?usp=pp_url",
      src: "https://assets.aipictors.com/home_banner_03.webp",
      blank: true,
    },
  ]

  const banners = [...staticBanners]

  const isExternalHref = (href: string) => {
    return href.startsWith("http://") || href.startsWith("https://")
  }

  const onSelect = (index: string) => {
    props.onSelect?.(index)
  }

  return (
    <div className="flex gap-x-4 overflow-x-auto">
      {props.ongoingEvents?.map((event) => (
        <div key={`event-${event.id}`} className="flex-none basis-auto">
          <Link
            to={`/events/${event.slug}`}
            className="relative block overflow-hidden rounded"
            onClick={() => onSelect(`event-${event.id}`)}
          >
            <img
              src={event.thumbnailImageUrl}
              alt={event.title}
              className="h-40 w-auto rounded object-cover md:h-48"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onError={() => {
                console.error(
                  `Failed to load event banner image: ${event.thumbnailImageUrl}`,
                )
                console.error("Event data:", event)
              }}
            />
          </Link>
        </div>
      ))}

      {/* 固定バナー */}
      {banners.map((banner, i) => (
        <div key={i.toString()} className="flex-none basis-auto">
          {isExternalHref(banner.href) ? (
            <a
              href={banner.href}
              target={banner.blank ? "_blank" : undefined}
              rel={banner.blank ? "noreferrer" : undefined}
              className="relative block overflow-hidden rounded"
              onClick={() => onSelect(i.toString())}
            >
              <img
                src={banner.src}
                alt={banner.title || `home_banner_${i + 1}`}
                className="h-40 w-auto rounded object-cover md:h-48"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onError={() => {
                  console.error(`Failed to load banner image: ${banner.src}`)
                  console.error("Banner data:", banner)
                }}
              />
            </a>
          ) : (
            <Link
              to={banner.href}
              className="relative block overflow-hidden rounded"
              onClick={() => onSelect(i.toString())}
            >
              <img
                src={banner.src}
                alt={banner.title || `home_banner_${i + 1}`}
                className="h-40 w-auto rounded object-cover md:h-48"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onError={() => {
                  console.error(`Failed to load banner image: ${banner.src}`)
                  console.error("Banner data:", banner)
                }}
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
