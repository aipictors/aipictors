import { AlbumWork } from "@/[lang]/(main)/albums/[album]/_components/album-work"
import type { AlbumWorksQuery } from "@/_graphql/__generated__/graphql"

type Props = {
  albumWorks: NonNullable<AlbumWorksQuery["album"]>["works"]
}

export const AlbumWorkList = (props: Props) => {
  return (
    <div className="flex flex-col">
      <AlbumWork
        albumWorks={props.albumWorks}
        title={props.albumWorks[0]?.title ?? "Untitled"}
        thumbnailImageUrl={props.albumWorks[0]?.largeThumbnailImageURL ?? ""}
        likesCount={props.albumWorks[0]?.likesCount ?? 0}
        createdAt={props.albumWorks[0]?.createdAt ?? 0}
      />
    </div>
  )
}
