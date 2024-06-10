import {} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { HomeVideosWorksSection } from "@/routes/($lang)._main._index/_components/home-video-works-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * 動画作品一覧
 */
export const HomeVideosSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      const userId = authContext.userId ?? "-1"

      try {
        const ids = await getRecommendedWorkIds(
          userId,
          undefined,
          "video",
          props.isSensitive ? "R18" : "G",
        )
        setRecommendedIds(ids)
      } catch (error) {
        console.error("Error fetching recommended work IDs:", error)
      }
    }

    fetchRecommendedIds()
  }, [authContext.userId])

  const { data: videoWorks } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ids: recommendedIds,
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  const workList =
    videoWorks?.works.filter((_, index) => index % 2 === 0) ?? null

  return <HomeVideosWorksSection works={workList} title={props.title} />
}
