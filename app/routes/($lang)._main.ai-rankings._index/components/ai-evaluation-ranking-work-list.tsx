import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  rankings: FragmentOf<typeof AiEvaluationRankingListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

function toAwardLabel(awardTier: string) {
  switch (awardTier) {
    case "FIRST":
      return "1位"
    case "TOP3":
      return "TOP3"
    case "TOP10":
      return "TOP10"
    case "TOP30":
      return "TOP30"
    default:
      return "ランクイン"
  }
}

export function AiEvaluationRankingWorkList(props: Props) {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(aiEvaluationWorkRankingsQuery, {
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

  const rankings = data?.aiEvaluationWorkRankings ?? props.rankings

  return (
    <>
      <div className="hidden flex-wrap justify-center gap-x-4 gap-y-4 md:flex">
        {rankings.map((workItem, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
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
                      ranking={workItem.index}
                      commentsCount={workItem.work.commentsCount}
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-1 font-bold text-white text-xs">
                      {workItem.overallScore}点
                    </div>
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
                  <p className="text-amber-600 text-xs dark:text-amber-300">
                    {toAwardLabel(workItem.awardTier)}
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
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 md:hidden">
        {rankings.map((workItem, index) => {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
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
                      ranking={workItem.index}
                      commentsCount={workItem.work.commentsCount}
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-1 font-bold text-white text-xs">
                      {workItem.overallScore}点
                    </div>
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
                  <p className="text-amber-600 text-xs dark:text-amber-300">
                    {toAwardLabel(workItem.awardTier)}
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

export const AiEvaluationRankingListItemFragment = graphql(
  `fragment AiEvaluationRankingListItem on AiEvaluationWorkRankingNode @_unmask {
    id
    index
    overallScore
    awardTier
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

const aiEvaluationWorkRankingsQuery = graphql(
  `query AiEvaluationWorkRankingsList($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)