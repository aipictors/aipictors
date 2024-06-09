import { Switch } from "@/_components/ui/switch"
import type { userAlbumsQuery } from "@/_graphql/queries/user/user-albums"
import { WorkCard } from "@/routes/($lang)._main.works._index/_components/work-card"
import { Link } from "@remix-run/react"
import type { ResultOf } from "gql.tada"

type Props = {
  albums: NonNullable<ResultOf<typeof userAlbumsQuery>["user"]>["albums"]
}

export const UserAlbumList = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <p>{"R18（n）"}</p>
        <Switch />
      </div>
      <ul className="grid w-full grid-cols-1 gap-2 pr-4 pb-4 md:grid-cols-2">
        {props.albums.map((album) => (
          <Link key={album.id} to={`/albums/${album.id}`}>
            <WorkCard imageURL={album.thumbnailImage?.downloadURL} />
          </Link>
        ))}
      </ul>
    </div>
  )
}
