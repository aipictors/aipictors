import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { LikeButton } from "~/components/like-button"
import { graphql, type FragmentOf } from "gql.tada"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof HomeNovelsWorkListItemFragment>[]
  title?: string
  tooltip?: string
  link?: string
  isCropped?: boolean
}

/**
 * 小説作品一覧
 */
export function HomeNovelsWorksSection(props: Props) {
  if (!props.works) {
    return null
  }

  if (props.works.length === 0) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        {props.title && (
          <h2 className="items-center space-x-2 font-bold text-md">
            {props.title}
          </h2>
        )}
      </div>
      <CarouselWithGradation
        items={props.works.map((work, index) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          <div className="h-full rounded border-2 border-gray border-solid">
            <div className="relative">
              <NovelWorkPreviewItem
                workId={work.id}
                imageUrl={work.smallThumbnailImageURL}
                title={work.title}
                text={work.description ?? ""}
                tags={[]}
              />
            </div>
            <UserNameBadge
              userId={work.user.id}
              userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
              name={work.user.name}
              width={"lg"}
              padding={"md"}
            />
            <div className="absolute right-0 bottom-0">
              <LikeButton
                size={56}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user.id}
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

export const HomeNovelsWorkListItemFragment = graphql(
  `fragment HomeNovelsWorkListItem on WorkNode @_unmask {
    id
    title
    description
    smallThumbnailImageURL
    isLiked
    user {
      id
      name
      iconUrl
    }
  }`,
)
