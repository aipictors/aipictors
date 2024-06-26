import { useContext } from "react"
import { worksQuery } from "@/_graphql/queries/work/works"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "@/_contexts/auth-context"
import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"

type Props = {
  tagName: string
  rating: "G" | "R15" | "R18" | "R18G"
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
        ratings: [props.rating],
      },
    },
  })

  const tagWork = suggestedWorkResp?.works ?? null

  return <ResponsivePhotoWorksAlbum works={tagWork} />
}
