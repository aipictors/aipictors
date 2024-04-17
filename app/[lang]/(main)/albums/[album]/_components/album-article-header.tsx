import type { AlbumQuery } from "@/_graphql/__generated__/graphql"
import { ShareIcon } from "lucide-react"

type Props = {
  album: NonNullable<AlbumQuery["album"]>
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <div className="flex flex-col">
      <img
        src={props.album.thumbnailImage?.downloadURL!}
        alt={props.album.title!}
      />
      <div className="flex">
        <p>{props.album.title}</p>
        <ShareIcon>{"Twitterでシェア"}</ShareIcon>
      </div>
    </div>
  )
}
