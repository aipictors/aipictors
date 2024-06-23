import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { BookmarkWorksListTable } from "@/routes/($lang).dashboard._index/_components/bookmark-works-list-table"
import { BookmarkWorksSpList } from "@/routes/($lang).dashboard._index/_components/bookmark-works-sp-list"

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
export const BookmarkWorksList = (props: Props) => {
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
        <BookmarkWorksListTable works={displayWorks} />
      ) : (
        <BookmarkWorksSpList works={displayWorks} />
      )}
    </>
  )
}
