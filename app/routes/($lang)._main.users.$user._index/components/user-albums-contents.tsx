import { Link } from "@remix-run/react"
import { Images } from "lucide-react"
import type { FragmentOf } from "gql.tada"
import type { UserAlbumListItemFragment } from "~/routes/($lang)._main.users.$user.albums/components/user-albums-content-body"

type Props = {
  userId: string
  albums: FragmentOf<typeof UserAlbumListItemFragment>[]
}

export function UserAlbumsContents(props: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {props.albums
          .filter((album) => album.works.length > 0)
          .map((album) => (
            <div
              key={album.id}
              className="h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
            >
              <div className="box-border flex flex-col justify-end">
                <Link
                  to={`/${album.user.login}/albums/${album.slug}`}
                  className="relative"
                >
                  <img
                    className="h-16 w-32 object-cover transition-all hover:scale-110 md:h-32 md:w-64"
                    src={
                      album.thumbnailImageURL
                        ? album.thumbnailImageURL
                        : album.works.length > 0
                          ? album.works[0].smallThumbnailImageURL
                          : ""
                    }
                    alt={album.title}
                  />
                  <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
                    <p className="absolute bottom-1 left-1 text-white">
                      {album.title}
                    </p>
                  </div>
                  {album.worksCount !== undefined && album.worksCount !== 0 && (
                    <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                      <Images className="h-3 w-3 text-white" />
                      <div className="font-bold text-white text-xs">
                        {album.worksCount}
                      </div>
                    </div>
                  )}
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
