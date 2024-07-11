import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { HomeNovelsWorksSection } from "@/routes/($lang)._main._index/_components/home-novels-works-section"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * 小説作品一覧
 */
export const HomeNovelsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      const userId = authContext.userId ?? "-1"

      try {
        const ids = await getRecommendedWorkIds(
          userId,
          undefined,
          "novel",
          props.isSensitive ? "R18" : "G",
        )
        setRecommendedIds(ids)
      } catch (error) {
        console.error("Error fetching recommended work IDs:", error)
      }
    }

    fetchRecommendedIds()
  }, [authContext.userId])

  const { data: novelWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 64,
      where: {
        ids: recommendedIds,
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  const workList = novelWorks?.works ?? null

  if (workList === null) {
    return null
  }

  // const workResults = workList.map((work) => ({
  //   id: work.id,
  //   src: work.smallThumbnailImageURL,
  //   width: work.smallThumbnailImageWidth,
  //   height: work.smallThumbnailImageHeight,
  //   workId: work.id,
  //   thumbnailImagePosition: work.thumbnailImagePosition,
  //   userId: work.user.id,
  //   userIcon: work.user.iconUrl,
  //   userName: work.user.name,
  //   title: work.title,
  //   isLiked: work.isLiked,
  //   text: work.description,
  //   tags: work.tags.map((tag) => tag.name).slice(0, 2),
  // }))

  // ランダムに24作品を選ぶ
  const works = workList.filter((_, index) => index % 2 === 0)

  return <HomeNovelsWorksSection works={works} title={props.title} />
}

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
