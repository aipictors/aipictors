import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { UserNameBadge } from "@/_components/user-name-badge"
import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  isRanking?: boolean
}

/**
 * クロップ済み作品一覧
 */
export const HomeCroppedWorkList = (props: Props) => {
  if (props.works === null || props.works.length === 0) {
    return null
  }

  const works = props.works.map((work) => ({
    id: work.id,
    src: work.smallThumbnailImageURL,
    width: work.smallThumbnailImageWidth,
    height: work.smallThumbnailImageHeight,
    workId: work.id,
    thumbnailImagePosition: work.thumbnailImagePosition,
    subWorksCount: work.subWorksCount,
    userId: work.user.id,
    userIcon: work.user.iconUrl,
    userName: work.user.name,
    title: work.title,
    isLiked: work.isLiked,
  }))

  return (
    <section className="relative space-y-4">
      <CarouselWithGradation
        items={works.map((work, index) => (
          <div key={work.id}>
            <div className="relative">
              <CroppedWorkSquare
                workId={work.id}
                subWorksCount={work.subWorksCount}
                imageUrl={work.src}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="lg"
                imageWidth={work.width}
                imageHeight={work.height}
                ranking={props.isRanking ? index + 1 : undefined}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.userId}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  isParticle={true}
                />
              </div>
            </div>
            <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
              {work.title}
            </p>
            <UserNameBadge
              userId={work.userId}
              userIconImageURL={IconUrl(work.userIcon)}
              name={work.userName}
              width={"lg"}
            />
          </div>
        ))}
      />
    </section>
  )
}
