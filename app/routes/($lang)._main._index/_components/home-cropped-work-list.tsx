import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { UserNameBadge } from "@/_components/user-name-badge"
import type { worksQuery } from "@/_graphql/queries/work/works"
import type { ResultOf } from "gql.tada"

type Props = {
  works: NonNullable<ResultOf<typeof worksQuery>["works"]> | null
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
    userId: work.user.id,
    userIcon: work.user.iconUrl,
    userName: work.user.name,
    title: work.title,
    isLiked: work.isLiked,
  }))

  return (
    <section className="relative space-y-4">
      <Carousel className="relative" opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {works.map((work, index) => (
            <CarouselItem
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="relative basis-1/3.5 space-y-2"
            >
              <div className="relative">
                <CroppedWorkSquare
                  workId={work.id}
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
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
        </CarouselContent>
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-black" />
      </Carousel>
    </section>
  )
}
