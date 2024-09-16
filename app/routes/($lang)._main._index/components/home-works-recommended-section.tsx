import { AuthContext } from "~/contexts/auth-context"
import { getRecommendedWorkIds } from "~/utils/get-recommended-work-ids"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useState } from "react"

type Props = {
  isSensitive?: boolean
}

/**
 * おすすめ作品セクション
 */
export function HomeWorksRecommendedSection(props: Props) {
  const appContext = useContext(AuthContext)

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      if (recommendedIds.length === 0) {
        if (appContext.isNotLoggedIn) {
          const userId = "-1"

          try {
            const ids = await getRecommendedWorkIds(
              userId,
              undefined,
              "image",
              props.isSensitive ? "R18" : "G",
            )
            setRecommendedIds(ids)
          } catch (error) {
            console.error("Error fetching recommended work IDs:", error)
          }
          return
        }
        if (appContext.isLoggedIn) {
          const userId = appContext.userId

          try {
            const ids = await getRecommendedWorkIds(
              userId,
              undefined,
              "image",
              props.isSensitive ? "R18" : "G",
            )
            setRecommendedIds(ids)
          } catch (error) {
            console.error("Error fetching recommended work IDs:", error)
          }
          return
        }
      }
    }

    fetchRecommendedIds()
  }, [appContext.userId])

  // おすすめ作品
  const { data: suggestedWorkResp } = useQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        ids: recommendedIds,
        ...(props.isSensitive && { ratings: ["R18", "R18G"] }),
      },
    },
  })

  const suggestedWorks = [...(suggestedWorkResp?.works || [])]

  return (
    <>
      <HomeWorkSection
        title={"おすすめ"}
        works={suggestedWorks}
        isCropped={false}
        isShowProfile={true}
      />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)
