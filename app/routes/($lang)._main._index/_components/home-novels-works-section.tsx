import { LikeButton } from "@/_components/like-button"
import { NovelWorkPreviewItem } from "@/_components/novel-work-preview-item"
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
  title: string
  tooltip?: string
  link?: string
  isCropped?: boolean
}

/**
 * 小説作品一覧
 */
export const HomeNovelsWorksSection = (props: Props) => {
  if (!props.works) {
    return null
  }

  const workResults = props.works.map((work) => ({
    id: work.id,
    src: work.smallThumbnailImageURL,
    width: work.smallThumbnailImageWidth,
    height: work.smallThumbnailImageHeight,
    workId: work.id,
    thumbnailImagePosition: work.thumbnailImagePosition,
    userId: work.user.id,
    userIcon: work.user.iconImage?.downloadURL,
    userName: work.user.name,
    title: work.title,
    isLiked: work.isLiked,
    text: work.title,
  }))

  const works = workResults

  if (works.length === 0) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
        {/* <Button variant={"secondary"} size={"sm"}>
          {"すべて見る"}
        </Button> */}
      </div>

      <Carousel className="relative" opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {works.map((work, index) => (
            <CarouselItem
              key={work.id}
              className="relative basis-1/3.5 space-y-2"
            >
              <div className="relative">
                <NovelWorkPreviewItem
                  workId={work.id}
                  imageUrl={work.src}
                  title={work.title}
                  text={work.text ?? ""}
                  tags={[]}
                />
              </div>
              <UserNameBadge
                userId={work.userId}
                userIconImageURL={work.userIcon}
                name={work.userName}
                width={"lg"}
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
                />
              </div>
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
        </CarouselContent>
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-black" />
      </Carousel>
    </section>
  )
}
