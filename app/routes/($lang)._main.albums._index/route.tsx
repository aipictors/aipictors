import { AlbumCard } from "~/routes/($lang)._main.albums._index/components/album-card"

/**
 * シリーズの一覧
 */
export default function albums() {
  return (
    <>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </>
  )
}
