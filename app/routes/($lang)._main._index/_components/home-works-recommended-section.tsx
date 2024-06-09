import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { HomeWorkDummies } from "@/routes/($lang)._main._index/_components/home-work-dummies"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"

/**
 * おすすめ作品セクション
 */
export const HomeWorksRecommendedSection = () => {
  const appContext = useContext(AuthContext)

  if (appContext.isLoading) {
    return (
      <>
        <HomeWorkDummies />
        <HomeWorkDummies />
      </>
    )
  }

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      if (recommendedIds.length === 0) {
        if (appContext.isNotLoggedIn) {
          const userId = "-1"

          try {
            const ids = await getRecommendedWorkIds(userId, undefined, "image")
            setRecommendedIds(ids)
          } catch (error) {
            console.error("Error fetching recommended work IDs:", error)
          }
          return
        }
        if (appContext.isLoggedIn) {
          const userId = appContext.userId

          try {
            const ids = await getRecommendedWorkIds(userId, undefined, "image")
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
  const { data: suggestedWorkResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        ids: recommendedIds,
      },
    },
  })

  const suggestedWorks = [...(suggestedWorkResp?.works || [])]

  const sections = [{ title: "おすすめ", works: suggestedWorks, tooltip: "" }]

  return (
    <>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip ? section.tooltip : undefined}
          works={section.works ?? null}
        />
      ))}
    </>
  )
}
