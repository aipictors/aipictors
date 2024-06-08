import { ResponsivePhotoVideoWorksAlbum } from "@/_components/responsive-photo-video-works-album"
import {} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"

type Props = {
  title: string
}

/**
 * 動画作品一覧
 */
export const HomeVideosSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: videoWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        workType: "VIDEO",
        ratings: ["G"],
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
