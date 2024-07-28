import type { SortType } from "@/types/sort-type"
import { AlbumsListTable } from "@/routes/($lang).my._index/components/albums-list-table"
import { AlbumsSpList } from "@/routes/($lang).my._index/components/albums-sp-list"
import type { IntrospectionEnum } from "@/lib/introspection-enum"

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
      <div className="hidden md:block">
        <AlbumsListTable
          albums={displayAlbums}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
        />
      </div>
      <div className="block md:hidden">
        <AlbumsSpList albums={displayAlbums} />
      </div>
    </>
  )
}
