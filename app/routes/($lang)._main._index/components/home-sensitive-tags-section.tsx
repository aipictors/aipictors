import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import React from "react"
import Autoplay from "embla-carousel-autoplay"
import { type FragmentOf, graphql } from "gql.tada"
import { HomeSensitiveTagsSectionItem } from "~/routes/($lang)._main._index/components/home-sensitive-tags-section-item"

type Props = {
  title?: string
  tags: FragmentOf<typeof HomeTagFragment>[]
}

export function HomeSensitiveTagsSection(props: Props) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  )

  return (
    <>
      <h2 className="items-center space-x-2 font-bold text-xl">
        {props.title}
      </h2>
      <Carousel
        opts={{ dragFree: true, loop: true }}
        // @ts-ignore
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {props.tags?.map((tag, index) => (
            <CarouselItem className="basis-auto" key={index.toString()}>
              <HomeSensitiveTagsSectionItem
                tagName={tag.tagName}
                tagThumbnailUrl={tag.thumbnailUrl}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-linear-to-r from-transparent to-card" /> */}
      </Carousel>
    </>
  )
}

export const HomeTagFragment = graphql(
  `fragment HomeTag on RecommendedTagNode @_unmask {
    tagName
    thumbnailUrl
  }`,
)
