import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
}

/**
 * 小説作品一覧
 */
export function UserNovelList(props: Props) {
  if (!props.works || props.works.length === 0) {
    return null
  }

  if (props.works.length === 0) {
    return null
  }

  return (
    <section className="m-2">
      <div className="flex-wrap justify-items-center space-y-4">
        {props.works.map((work) => (
          <div
            key={work.id}
            className="relative ml-4 inline-block h-full rounded border-2 border-gray border-solid"
          >
            <NovelWorkPreviewItem
              workId={work.id}
              imageUrl={work.smallThumbnailImageURL}
              title={work.title}
              text={work.description ?? ""}
              tags={[]}
            />
            <UserNameBadge
              userId={work.user.id}
              userIconImageURL={IconUrl(work.user.iconUrl)}
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
      </div>
    </section>
  )
}
