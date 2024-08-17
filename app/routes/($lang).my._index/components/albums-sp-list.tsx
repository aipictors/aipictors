import { AlbumsSpListItem } from "~/routes/($lang).my._index/components/albums-sp-list-item"

type Props = {
  albums: {
    id: string
    userId: string
    title: string
    slug: string
    thumbnailImageUrl: string
    createdAt: string
  }[]
}

/**
 * スマホ向けシリーズ一覧
 */
export function AlbumsSpList(props: Props) {
  return (
    <>
      {props.albums.map((album, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index}>
          <AlbumsSpListItem album={album} />
        </div>
      ))}
    </>
  )
}
