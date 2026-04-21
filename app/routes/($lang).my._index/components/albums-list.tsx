import type { SortType } from "~/types/sort-type"
import {
  AlbumsListTable,
  AlbumTableItemFragment,
} from "~/routes/($lang).my._index/components/albums-list-table"
import { AlbumsSpList } from "~/routes/($lang).my._index/components/albums-sp-list"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"
import { MobileAlbumListItemFragment } from "~/routes/($lang).my._index/components/albums-sp-list-item"
import {
  SortableAlbumListItemFragment,
  SortableAlbumsList,
} from "~/routes/($lang).my._index/components/albums-sortable-list"

type Props = {
  albums: FragmentOf<typeof AlbumListItemFragment>[]
  refetch: () => void
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export function AlbumsList (props: Props) {
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
      {props.orderBy === "MANUAL" && (
        <SortableAlbumsList albums={props.albums} refetch={props.refetch} />
      )}
      <div className="hidden md:block">
        {props.orderBy !== "MANUAL" && (
          <AlbumsListTable
            albums={displayAlbums}
            sort={props.sort}
            orderBy={props.orderBy}
            onClickTitleSortButton={props.onClickTitleSortButton}
            onClickDateSortButton={props.onClickDateSortButton}
          />
        )}
      </div>
      <div className="block md:hidden">
        {props.orderBy !== "MANUAL" && <AlbumsSpList albums={props.albums} />}
      </div>
    </>
  )
}

export const AlbumListItemFragment = graphql(
  `fragment AlbumListItem on AlbumNode @_unmask {
    ...AlbumTableItem
    ...MobileAlbumListItem
    ...SortableAlbumListItem
  }`,
  [
    AlbumTableItemFragment,
    MobileAlbumListItemFragment,
    SortableAlbumListItemFragment,
  ],
)
