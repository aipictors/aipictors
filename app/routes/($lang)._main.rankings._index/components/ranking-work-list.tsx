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

function RankingWorkCard(props: {
  workItem: FragmentOf<typeof WorkAwardListItemFragment>
  index: number
  featured?: boolean
}) {
  const { workItem, index, featured = false } = props

  if (!workItem.work) {
    return null
  }

  return (
    <article className="group overflow-hidden rounded-[28px] border border-border/40 bg-background/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={featured ? "p-4 sm:p-5" : "p-3 sm:p-4"}>
        <div className={featured ? "space-y-4" : "space-y-3"}>
          <div className="relative overflow-hidden rounded-[24px] bg-muted/30">
            <CroppedWorkSquare
              workId={workItem.work.id}
              subWorksCount={workItem.work.subWorksCount}
              imageUrl={workItem.work.smallThumbnailImageURL}
              thumbnailImagePosition={workItem.work.thumbnailImagePosition ?? 0}
              size="auto"
              imageWidth={workItem.work.smallThumbnailImageWidth}
              imageHeight={workItem.work.smallThumbnailImageHeight}
              ranking={index + 1}
              commentsCount={workItem.work.commentsCount}
            />
            <div className="absolute right-2 bottom-2">
              <LikeButton
                size={featured ? 52 : 44}
                targetWorkId={workItem.work.id}
                targetWorkOwnerUserId={workItem.work.user?.id ?? ""}
                defaultLiked={workItem.work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className={featured ? "line-clamp-2 font-bold text-base text-foreground sm:text-lg" : "line-clamp-2 font-bold text-sm text-foreground sm:text-base"}>
              {workItem.work.title}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                #{index + 1}
              </span>
              <span className="rounded-full bg-pink-100 px-2.5 py-1 font-medium text-pink-700 dark:bg-pink-950/60 dark:text-pink-200">
                {workItem.snapshotLikedCount} いいね
              </span>
            </div>
          </div>

          {workItem.work.user && (
            <UserNameBadge
              userId={workItem.work.user.id}
              userIconImageURL={withIconUrlFallback(workItem.work.user.iconUrl)}
              name={workItem.work.user.name}
              width={"md"}
              likesCount={workItem.work.likesCount}
              snapshotLikedCount={workItem.snapshotLikedCount}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export function RankingWorkList (props: Props) {
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
  const featuredAwards = workAwards.slice(0, 3)
  const standardAwards = workAwards.slice(3)

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 pb-8 sm:px-4 lg:px-0">
      {featuredAwards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {featuredAwards.map((workItem, index) => (
            <RankingWorkCard
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              key={index}
              workItem={workItem}
              index={index}
              featured={true}
            />
          ))}
        </div>
      )}

      {standardAwards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {standardAwards.map((workItem, index) => (
            <RankingWorkCard
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              key={index + 3}
              workItem={workItem}
              index={index + 3}
            />
          ))}
        </div>
      )}
    </div>
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
