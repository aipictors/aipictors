import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { useContext } from "react"
import {
  RankingList,
  RankingPodium,
} from "~/components/ranking/ranking-awards-view"
import { AuthContext } from "~/contexts/auth-context"

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
    <div className="mx-auto max-w-6xl space-y-4 pb-8 md:space-y-6">
      <RankingPodium items={workAwards} />
      <RankingList items={workAwards.slice(3)} startRank={4} />
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
        enTitle
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
