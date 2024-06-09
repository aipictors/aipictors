import type { albumWorksQuery } from "@/_graphql/queries/album/album-works"
import { AlbumWork } from "@/routes/($lang)._main.albums.$album/_components/album-work"
import type { ResultOf } from "gql.tada"

type Props = {
  albumWorks: NonNullable<ResultOf<typeof albumWorksQuery>["album"]>["works"]
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
