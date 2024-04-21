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

type Work = {
  id: string
  largeThumbnailImageURL: string
  largeThumbnailImageHeight: number
  largeThumbnailImageWidth: number
}

type Props = {
  works: Work[]
}

export function WorkRelatedList(props: Props) {
  return (
    <div className="max-w-[80vw] space-y-4 pt-2">
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent>
          {props.works.map((work) => (
            <CarouselItem
              key={work.id}
              className="mr-2 basis-1/3 rounded bg-gray-100 lg:basis-1/4 md:basis-1/4 sm:basis-1/3 dark:bg-gray-900"
            >
              <Link to={`/works/${work.id}`}>
                <img
                  key={work.id}
                  className="h-24 w-24 rounded object-cover lg:h-40 md:h-32 lg:w-40 md:w-32" // object-cover を object-contain に変更
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
