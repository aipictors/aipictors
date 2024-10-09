import type { FragmentOf } from "gql.tada"
import { LikeButton } from "~/components/like-button"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import type { UserNovelsItemFragment } from "~/routes/($lang)._main.users.$user.novels/components/user-novels-content-body"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

type Props = {
  novels: FragmentOf<typeof UserNovelsItemFragment>[]
}

export function UserSensitiveNovelsContents(props: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-4">
        {props.novels.map((work) => (
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
              userIconImageURL={ExchangeIconUrl(work.user.iconUrl)}
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
    </>
  )
}
