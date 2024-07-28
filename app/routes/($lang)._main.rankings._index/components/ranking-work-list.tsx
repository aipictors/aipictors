import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import { UserNameBadge } from "~/components/user-name-badge"
import type { workAwardFieldsFragment } from "~/graphql/fragments/work-award-field"
import type { FragmentOf } from "gql.tada"

type Props = {
  awards: FragmentOf<typeof workAwardFieldsFragment>[]
}

export const RankingWorkList = (props: Props) => {
  const works = props.awards

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-8">
      {works.map((workItem, index) => {
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className="relative flex flex-col space-y-2"
          >
            <div className="relative">
              <CroppedWorkSquare
                workId={workItem.work.id}
                subWorksCount={workItem.work.subWorksCount}
                imageUrl={workItem.work.smallThumbnailImageURL}
                thumbnailImagePosition={
                  workItem.work.thumbnailImagePosition ?? 0
                }
                size="lg"
                imageWidth={workItem.work.smallThumbnailImageWidth}
                imageHeight={workItem.work.smallThumbnailImageHeight}
                ranking={index + 1}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={workItem.work.id}
                  targetWorkOwnerUserId={workItem.work.user.id}
                  defaultLiked={workItem.work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>
            <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
              {workItem.work.title}
            </p>
            <UserNameBadge
              userId={workItem.work.user.id}
              userIconImageURL={IconUrl(workItem.work.user.iconUrl)}
              name={workItem.work.user.name}
              width={"md"}
            />
          </div>
        )
      })}
    </div>
  )
}
