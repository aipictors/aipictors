import type { albumQuery } from "@/_graphql/queries/album/album"
import type { ResultOf } from "gql.tada"
import { ShareIcon } from "lucide-react"

type Props = {
  album: NonNullable<ResultOf<typeof albumQuery>["album"]>
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <div className="flex flex-col">
      <img src={props.album.thumbnailImageURL ?? ""} alt={props.album.title} />
      <div className="flex">
        <p>{props.album.title}</p>
        <ShareIcon>{"Twitterでシェア"}</ShareIcon>
      </div>
    </div>
  )
}
