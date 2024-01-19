/**
 * 作品の関連作品一覧
 */

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"

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
    <div className="space-y-4">
      <p className="text-lg">関連作品</p>
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent>
          {works.map((work) => (
            <CarouselItem
              key={work.id}
              className="basis-1/4 md:basis-1/5 lg:basis-1/6"
            >
              <Link href={`/works/${work.id}`}>
                <Image
                  key={work.id}
                  className="h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40  object-cover rounded"
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
