import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { NovelWorkPreviewItem } from "@/_components/novel-work-preview-item"
import { UserNameBadge } from "@/_components/user-name-badge"
import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
}

/**
 * 小説作品一覧
 */
export const UserNovelList = (props: Props) => {
  if (!props.works || props.works.length === 0) {
    return null
  }

  const workResults = props.works.map((work) => ({
    id: work.id,
    src: work.smallThumbnailImageURL,
    workId: work.id,
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
    <section className="m-2">
      <div className="flex-wrap justify-items-center space-y-4">
        {works.map((work) => (
          <div
            key={work.id}
            className="relative ml-4 inline-block rounded border-2 border-gray border-solid"
          >
            <NovelWorkPreviewItem
              workId={work.id}
              imageUrl={work.src}
              title={work.title}
              text={work.text ?? ""}
            />
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
      </div>
    </section>
  )
}
