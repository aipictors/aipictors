import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { BookmarkWorksListTable } from "~/routes/($lang).my._index/components/bookmark-works-list-table"
import { BookmarkWorksSpList } from "~/routes/($lang).my._index/components/bookmark-works-sp-list"

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
export function BookmarkWorksList(props: Props) {
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
        <BookmarkWorksListTable works={displayWorks} />
      </div>
      <div className="block md:hidden">
        <BookmarkWorksSpList works={displayWorks} />
      </div>
    </>
  )
}
