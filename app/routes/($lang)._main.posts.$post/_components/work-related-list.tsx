/**
 * 作品の関連作品一覧
 */

import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { LikeButton } from "@/_components/like-button"
import {} from "@/_components/ui/carousel"
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
    subWorksCount: number
  }[]
}

/**
 * 直近の作品一覧
 */
export function WorkRelatedList(props: Props) {
  return (
    <div className="relative space-y-4">
      <CarouselWithGradation
        items={props.works.map((work) => (
          <div key={work.id} className="relative">
            <CroppedWorkSquare
              workId={work.id}
              subWorksCount={work.subWorksCount}
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
        ))}
      />
      <Separator />
    </div>
  )
}
