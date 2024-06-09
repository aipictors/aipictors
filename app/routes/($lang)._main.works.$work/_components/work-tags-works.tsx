import { useContext } from "react"
import { ResponsivePhotoVideoWorksAlbum } from "@/_components/responsive-photo-video-works-album"
import { worksQuery } from "@/_graphql/queries/work/works"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "@/_contexts/auth-context"

type Props = {
  tagName: string
}

/**
 * タグ関連の作品
 */
export const WorkTagsWorks = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data: suggestedWorkResp } = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        tagNames: [props.tagName],
      },
    },
  })

  const tagWork = suggestedWorkResp?.works ?? null

  return <ResponsivePhotoVideoWorksAlbum works={tagWork} />
}
