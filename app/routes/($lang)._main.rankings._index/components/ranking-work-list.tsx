import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  awards: FragmentOf<typeof WorkAwardListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

export function RankingWorkList(props: Props) {
  const appContext = useContext(AuthContext)

  const works = props.awards

  const { data: awardWorks } = useQuery(workAwardsQuery, {
    skip: appContext.isLoading || appContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: props.year,
        month: props.month,
        ...(props.day && { day: props.day }),
        ...(props.weekIndex && { weekIndex: props.weekIndex }),
      },
    },
  })

  const workAwards = awardWorks?.workAwards ?? works

  return (
    <>
      <div className="hidden flex-wrap justify-center gap-x-4 gap-y-4 md:flex">
        {workAwards.map((workItem, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="relative flex flex-col space-y-4"
            >
              {workItem.work && (
                <div className="relative flex w-32 flex-col space-y-2">
                  <div className="relative">
                    <CroppedWorkSquare
                      workId={workItem.work.id}
                      subWorksCount={workItem.work.subWorksCount}
                      imageUrl={workItem.work.smallThumbnailImageURL}
                      thumbnailImagePosition={
                        workItem.work.thumbnailImagePosition ?? 0
                      }
                      size="md"
                      imageWidth={workItem.work.smallThumbnailImageWidth}
                      imageHeight={workItem.work.smallThumbnailImageHeight}
                      ranking={index + 1}
                      commentsCount={workItem.work.commentsCount}
                    />
                    <div className="absolute right-0 bottom-0">
                      <LikeButton
                        size={56}
                        targetWorkId={workItem.work.id}
                        targetWorkOwnerUserId={workItem.work.user?.id ?? ""}
                        defaultLiked={workItem.work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <p className="max-w-32 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
                    {workItem.work.title}
                  </p>
                  {workItem.work.user && (
                    <UserNameBadge
                      userId={workItem.work.user.id}
                      userIconImageURL={withIconUrlFallback(
                        workItem.work.user.iconUrl,
                      )}
                      name={workItem.work.user.name}
                      width={"md"}
                      likesCount={workItem.work.likesCount}
                      snapshotLikedCount={workItem.snapshotLikedCount}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 md:hidden">
        {workAwards.map((workItem, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="relative flex flex-col space-y-2"
            >
              {workItem.work && (
                <>
                  <div className="relative">
                    <CroppedWorkSquare
                      workId={workItem.work.id}
                      subWorksCount={workItem.work.subWorksCount}
                      imageUrl={workItem.work.smallThumbnailImageURL}
                      thumbnailImagePosition={
                        workItem.work.thumbnailImagePosition ?? 0
                      }
                      size="md"
                      imageWidth={workItem.work.smallThumbnailImageWidth}
                      imageHeight={workItem.work.smallThumbnailImageHeight}
                      ranking={index + 1}
                      commentsCount={workItem.work.commentsCount}
                    />
                    <div className="absolute right-0 bottom-0">
                      <LikeButton
                        size={56}
                        targetWorkId={workItem.work.id}
                        targetWorkOwnerUserId={workItem.work.user?.id ?? ""}
                        defaultLiked={workItem.work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <p className="max-w-32 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
                    {workItem.work.title}
                  </p>
                  {workItem.work.user && (
                    <UserNameBadge
                      userId={workItem.work.user.id}
                      userIconImageURL={withIconUrlFallback(
                        workItem.work.user.iconUrl,
                      )}
                      name={workItem.work.user.name}
                      width={"sm"}
                      likesCount={workItem.work.likesCount}
                    />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export const WorkAwardListItemFragment = graphql(
  `fragment WorkAwardListItem on WorkAwardNode @_unmask {
      id
      index
      dateText
      snapshotLikedCount
      work {
        id
        title
        accessType
        adminAccessType
        type
        likesCount
        commentsCount
        bookmarksCount
        viewsCount
        createdAt
        rating
        isTagEditable
        smallThumbnailImageURL
        smallThumbnailImageHeight
        smallThumbnailImageWidth
        largeThumbnailImageURL
        largeThumbnailImageHeight
        largeThumbnailImageWidth
        type
        prompt
        negativePrompt
        isLiked
        thumbnailImagePosition
        description
        url
        subWorksCount
        tags {
          name
        }
        user {
          id
          name
          iconUrl
        }
      }
  }`,
)

const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      ...WorkAwardListItem
    }
  }`,
  [WorkAwardListItemFragment],
)
