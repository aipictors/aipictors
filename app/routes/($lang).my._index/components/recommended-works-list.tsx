import { RecommendedWorksListTable } from "~/routes/($lang).my._index/components/recommended-works-list-table"
import { RecommendedWorksSpList } from "~/routes/($lang).my._index/components/recommended-works-sp-list"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

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
export function RecommendedWorksList(props: Props) {
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
      <div className="hidden md:block">
        <RecommendedWorksListTable works={displayWorks} />
      </div>
      <div className="block md:hidden">
        <RecommendedWorksSpList works={displayWorks} />
      </div>
    </>
  )
}
