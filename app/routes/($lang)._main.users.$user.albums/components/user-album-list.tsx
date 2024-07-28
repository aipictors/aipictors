import { Switch } from "~/components/ui/switch"
import type { partialAlbumFieldsFragment } from "~/graphql/fragments/partial-album-fields"
import { WorkCard } from "~/routes/($lang)._main.posts._index/components/work-card"
import { Link } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"

type Props = {
  albums: FragmentOf<typeof partialAlbumFieldsFragment>[]
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
            <WorkCard imageURL={album.thumbnailImageURL ?? ""} />
          </Link>
        ))}
      </ul>
    </div>
  )
}
