import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { config } from "@/config"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  isSensitive?: boolean
}

/**
 * おすすめ作品セクション
 */
export const HomeWorksRecommendedSection = (props: Props) => {
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

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <HomeWorkSection
        title={"おすすめ"}
        works={suggestedWorks}
        isCropped={!isDesktop}
      />
    </>
  )
}
