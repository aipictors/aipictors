import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
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
    userIcon: work.user.iconUrl,
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

      <CarouselWithGradation
        items={works.map((work, index) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          <div className="rounded border-2 border-gray border-solid">
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
              userIconImageURL={IconUrl(work.userIcon)}
              name={work.userName}
              width={"lg"}
              padding={"md"}
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
          </div>
        ))}
      />
    </section>
  )
}
