import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import React, { useEffect, useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { type FragmentOf, graphql } from "gql.tada"
import { HomeTagsSectionItem } from "~/routes/($lang)._main._index/components/home-tags-section-item"

type Props = {
  title?: string
  tags: FragmentOf<typeof HomeTagFragment>[]
  onSelect?: (index: string) => void
}

export function HomeTagsSection (props: Props) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  )

  // カルーセル（embla）は画面に近づいてから動かす。
  // ページの一番下にあるのに、表示直後の初期化でレイアウトの計算（約 60ms・遅い端末）が走っていた。
  // それまでは同じ見た目の並びを出しておく（中身も HTML に出る）
  const [isActive, setIsActive] = useState(false)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive) return
    const target = placeholderRef.current
    if (!target || !("IntersectionObserver" in window)) {
      setIsActive(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px 0px" },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [isActive])

  const items = props.tags?.map((tag, index) => (
    <HomeTagsSectionItem
      key={index.toString()}
      tagName={tag.tagName}
      tagThumbnailUrl={tag.thumbnailUrl}
    />
  ))

  return (
    <>
      <h2 className="items-center space-x-2 font-bold text-xl">
        {props.title}
      </h2>
      {isActive ? (
        <Carousel
          opts={{ dragFree: true, loop: true }}
          // @ts-ignore
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {items?.map((item) => (
              <CarouselItem className="basis-auto" key={item.key}>
                {item}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        // Carousel・CarouselContent・CarouselItem と同じ見た目
        <div ref={placeholderRef} className="relative">
          <div className="overflow-hidden">
            <div className="-ml-4 flex">
              {items?.map((item) => (
                <div
                  key={item.key}
                  className="min-w-0 shrink-0 grow-0 basis-auto pl-4"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export const HomeTagFragment = graphql(
  `fragment HomeTag on RecommendedTagNode @_unmask {
    tagName
    thumbnailUrl
  }`,
)
