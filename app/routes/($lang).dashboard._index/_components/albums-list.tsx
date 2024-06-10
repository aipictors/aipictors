import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import { AlbumsListTable } from "@/routes/($lang).dashboard._index/_components/albums-list-table"
import { AlbumsSpList } from "@/routes/($lang).dashboard._index/_components/albums-sp-list"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  albums: {
    id: string
    userId: string
    title: string
    slug: string
    thumbnailImageUrl: string
    createdAt: string
  }[]
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export const AlbumsList = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const displayAlbums = props.albums.map((album) => {
    return {
      ...album,
      title: truncateTitle(album.title, 32),
    }
  })

  return (
    <>
      {isDesktop ? (
        <AlbumsListTable
          albums={displayAlbums}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
        />
      ) : (
        <AlbumsSpList albums={displayAlbums} />
      )}
    </>
  )
}
