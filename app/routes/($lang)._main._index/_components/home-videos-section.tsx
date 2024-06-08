import { ResponsivePhotoVideoWorksAlbum } from "@/_components/responsive-photo-video-works-album"
import {} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"

type Props = {
  title: string
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
        const ids = await getRecommendedWorkIds(userId, undefined, "video", "G")
        setRecommendedIds(ids)
      } catch (error) {
        console.error("Error fetching recommended work IDs:", error)
      }
    }

    fetchRecommendedIds()
  }, [authContext.userId])

  const { data: videoWorks } = useQuery(worksQuery, {
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

  if (workList === null) {
    return null
  }

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
      </div>

      <ResponsivePhotoVideoWorksAlbum works={workList} />
    </section>
  )
}
