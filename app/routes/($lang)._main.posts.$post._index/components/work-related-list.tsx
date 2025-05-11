/**
 * 作品の関連作品一覧
 */

import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { Separator } from "~/components/ui/separator"

type Props = {
  works: {
    smallThumbnailImageURL: string // imageUrlからsmallThumbnailImageURLに変更
    thumbnailImagePosition: number
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
    id: string
    userId: string
    isLiked: boolean
    subWorksCount: number
    commentsCount: number
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
              smallThumbnailImageURL={work.smallThumbnailImageURL}
              thumbnailImagePosition={
                work.thumbnailImagePosition ? work.thumbnailImagePosition : 0
              }
              size="md"
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              commentsCount={work.commentsCount}
            />
          </div>
        ))}
      />
      <Separator />
    </div>
  )
}
