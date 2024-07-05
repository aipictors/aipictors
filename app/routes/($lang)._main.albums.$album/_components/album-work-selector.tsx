import { Card } from "@/_components/ui/card"
import type { albumQuery } from "@/_graphql/queries/album/album"
import { XIntent } from "@/routes/($lang)._main.posts.$post/_components/work-action-share-x"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"

type Props = {
  album: NonNullable<ResultOf<typeof albumQuery>["album"]>
  thumbnail?: string
  userLogin: string
  userId: string
  userName: string
  userProfileImageURL: string
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <Card className="flex flex-col items-center p-4">
      <img
        src={props.thumbnail ?? ""}
        alt={props.album.title}
        className="w-full rounded-md object-cover"
      />
      <div className="mt-4 flex flex-col items-center">
        <Link to={`/users/${props.userLogin}`}>
          <div className="flex max-w-32 items-center overflow-hidden">
            <img
              src={props.userProfileImageURL}
              alt={props.userName}
              className="mr-2 h-8 w-8 rounded-full"
            />
            <p className="font-semibold text-lg">{props.userName}</p>
          </div>
        </Link>
        <p className="mt-2 text-center">{props.album.title}</p>
        <div className="mt-4 flex items-center">
          <XIntent
            text={`${props.album.title}\n`}
            url={`${`https://beta.aipictors.com/${props.userId}/albums/${props.album.slug}`}\n`}
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <p>{props.album.description}</p>
      </div>
    </Card>
  )
}
