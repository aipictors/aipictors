/**
 * 作品の関連作品一覧
 */

import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { LikeButton } from "@/_components/like-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import { Separator } from "@/_components/ui/separator"

type Props = {
  works: {
    smallThumbnailImageURL: string
    thumbnailImagePosition: number
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
    id: string
    userId: string
    isLiked: boolean
  }[]
}

/**
 * 直近の作品一覧
 */
export function WorkRelatedList(props: Props) {
  return (
    <div className="space-y-4 pt-2">
      <Carousel opts={{ dragFree: true }}>
        <CarouselContent>
          {props.works.map((work) => (
            <CarouselItem
              key={work.id}
              className="relative basis-1/3.5 space-y-2"
            >
              <div className="relative">
                <CroppedWorkSquare
                  workId={work.id}
                  imageUrl={work.smallThumbnailImageURL}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="md"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
                />
                <div className="absolute right-0 bottom-0">
                  <LikeButton
                    size={32}
                    targetWorkId={work.id}
                    targetWorkOwnerUserId={work.userId}
                    defaultLiked={false}
                    defaultLikedCount={0}
                    isBackgroundNone={true}
                    strokeWidth={2}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Separator />
    </div>
  )
}
