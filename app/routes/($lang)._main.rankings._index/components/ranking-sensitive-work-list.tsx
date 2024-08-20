import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { IconUrl } from "~/components/icon-url"
import { LikeButton } from "~/components/like-button"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"

type Props = {
  awards: FragmentOf<typeof SensitiveWorkAwardListItemFragment>[]
  year: number
  month: number
  day: number | null
  weekIndex: number | null
}

export function RankingSensitiveWorkList(props: Props) {
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
        isSensitive: true,
      },
    },
  })

  const workAwards = awardWorks?.workAwards ?? works

  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-8">
      {workAwards.map((workItem, index) => {
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
                size="md"
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
            <p className="max-w-32 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
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

export const SensitiveWorkAwardListItemFragment = graphql(
  `fragment SensitiveWorkAwardListItem on WorkAwardNode @_unmask {
      id
      index
      dateText
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
      ...SensitiveWorkAwardListItem
    }
  }`,
  [SensitiveWorkAwardListItemFragment],
)
