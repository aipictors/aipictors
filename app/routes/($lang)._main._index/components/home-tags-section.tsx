import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  title?: string
  tags: FragmentOf<typeof HomeTagFragment>[]
}

export const HomeTagsSection = (props: Props) => {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  )

  return (
    <>
      <h2 className="items-center space-x-2 font-bold text-md">
        {props.title}
      </h2>
      <Carousel
        opts={{ dragFree: true, loop: true }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {props.tags?.map((tag, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <CarouselItem className="basis-auto" key={index}>
              <div className="group relative overflow-hidden rounded-md">
                <Link
                  to={`https://www.aipictors.com/search/?tag=${tag.tagName}`}
                  className="rounded-md"
                >
                  <img
                    className="h-[240px] w-[196px] bg-white object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
                    src={tag.thumbnailUrl}
                    alt={tag.tagName}
                  />
                  <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 flex-col justify-end bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-88">
                    <p className="text-white">{`#${tag.tagName}`}</p>
                  </div>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-card" /> */}
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
