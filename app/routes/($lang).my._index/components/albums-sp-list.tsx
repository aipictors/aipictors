import type { FragmentOf } from "gql.tada"
import {
  AlbumsSpListItem,
  type MobileAlbumListItemFragment,
} from "~/routes/($lang).my._index/components/albums-sp-list-item"

type Props = {
  albums: FragmentOf<typeof MobileAlbumListItemFragment>[]
}

/**
 * スマホ向けシリーズ一覧
 */
export function AlbumsSpList(props: Props) {
  return (
    <>
      {props.albums.map((album, _index) => (
        <div key={album.id}>
          <AlbumsSpListItem album={album} />
        </div>
      ))}
    </>
  )
}
