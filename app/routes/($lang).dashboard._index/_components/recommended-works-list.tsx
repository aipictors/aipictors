import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import { RecommendedWorksListTable } from "@/routes/($lang).dashboard._index/_components/recommended-works-list-table"
import { RecommendedWorksSpList } from "@/routes/($lang).dashboard._index/_components/recommended-works-sp-list"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }[]
}

/**
 * 推薦作品一覧
 */
export const RecommendedWorksList = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const displayWorks = props.works.map((work) => {
    return {
      ...work,
      title: truncateTitle(work.title, 32),
    }
  })

  return (
    <>
      {isDesktop ? (
        <RecommendedWorksListTable works={displayWorks} />
      ) : (
        <RecommendedWorksSpList works={displayWorks} />
      )}
    </>
  )
}
