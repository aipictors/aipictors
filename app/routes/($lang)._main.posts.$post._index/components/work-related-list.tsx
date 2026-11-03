/**
 * 作品の関連作品一覧
 */

import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Separator } from "~/components/ui/separator"
import { WorkLazySection } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"

type Props = {
  works: {
    smallThumbnailImageURL: string
    thumbnailImagePosition: number
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
    id: string
    title?: string
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
              title={work.title}
              workId={work.id}
              subWorksCount={work.subWorksCount}
              imageUrl={work.smallThumbnailImageURL}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              size="md"
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              commentsCount={work.commentsCount}
            />
            <div className="absolute right-0 bottom-0">
              <LikeButton
                size={32}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.userId}
                defaultLiked={work.isLiked}
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

/**
 * 作者の他の作品。小さいサムネイルの横スクロールにしている（ユーザーの要望で、大きいグリッドには戻さない）
 */
export function WorkAuthorWorks(props: {
  works: Props["works"]
  currentWorkId: string
  header: React.ReactNode
}) {
  const works = props.works.filter((work) => work.id !== props.currentWorkId)

  if (works.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      {props.header}
      <WorkLazySection minHeightClassName="min-h-32">
        <CarouselWithGradation
          items={works.map((work) => (
            <div key={work.id} className="relative">
              <CroppedWorkSquare
                title={work.title}
                workId={work.id}
                subWorksCount={work.subWorksCount}
                imageUrl={work.smallThumbnailImageURL}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="md"
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
                commentsCount={work.commentsCount}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={32}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.userId}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>
          ))}
        />
      </WorkLazySection>
    </section>
  )
}
