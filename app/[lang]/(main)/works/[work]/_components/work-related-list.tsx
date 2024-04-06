/**
 * 作品の関連作品一覧
 */

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import { Separator } from "@/_components/ui/separator"
import { Link } from "@remix-run/react"
import Image from "next/image"

type Work = {
  id: string
  largeThumbnailImageURL: string
  largeThumbnailImageHeight: number
  largeThumbnailImageWidth: number
}

type WorkRelatedListProps = {
  works: Work[]
}

export default function WorkRelatedList({ works }: WorkRelatedListProps) {
  return (
    <div className="space-y-4 pt-2">
      <p className="text-lg">関連作品</p>
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent>
          {works.map((work) => (
            <CarouselItem
              key={work.id}
              className="basis-1/4 lg:basis-1/6 md:basis-1/5"
            >
              <Link to={`/works/${work.id}`}>
                <Image
                  key={work.id}
                  className="h-24 w-24 rounded object-cover lg:h-40 md:h-32 lg:w-40 md:w-32"
                  alt=""
                  src={work.largeThumbnailImageURL}
                  height={work.largeThumbnailImageHeight}
                  width={work.largeThumbnailImageWidth}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Separator />
    </div>
  )
}
