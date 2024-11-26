import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { graphql, type FragmentOf } from "gql.tada"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof HomeCoppedWorkFragment>[]
  isRanking?: boolean
}

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorkListWithScroll(props: Props) {
  if (props.works === null || props.works.length === 0) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <CarouselWithGradation
        items={props.works.map((work, index) => (
          <div key={work.id} className="flex flex-col space-y-2">
            <div className="relative">
              <CroppedWorkSquare
                workId={work.id}
                subWorksCount={work.subWorksCount}
                imageUrl={work.smallThumbnailImageURL}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="lg"
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
                ranking={props.isRanking ? index + 1 : undefined}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.user?.id ?? ""}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  isParticle={true}
                />
              </div>
            </div>
            <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
              {work.title}
            </p>
            <UserNameBadge
              userId={work.user?.id ?? ""}
              userIconImageURL={withIconUrlFallback(work.user?.iconUrl)}
              name={work.user?.name ?? ""}
              width={"lg"}
            />
          </div>
        ))}
      />
    </section>
  )
}

export const HomeCoppedWorkFragment = graphql(
  `fragment HomeCoppedWork on WorkNode @_unmask {
    id
    title
    likesCount
    isLiked
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    thumbnailImagePosition
    subWorksCount
    user {
      id
      name
      iconUrl
    }
  }`,
)
