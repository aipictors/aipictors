import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Images } from "lucide-react"

type Props = {
  album: FragmentOf<typeof AlbumItemFragment>
  works: FragmentOf<typeof AlbumItemWorkFragment>[]
  targetRowHeight?: number
}

/**
 * レスポンシブ対応のアルバム一覧
 */
export const ResponsiveAlbumsList = (props: Props) => {
  return (
    <div
      key={props.album.id}
      className="h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
    >
      <div className="box-border flex flex-col justify-end">
        <Link
          to={`/${props.album.user.login}/albums/${props.album.slug}`}
          className="relative"
        >
          <img
            className="h-16 w-32 object-cover transition-all hover:scale-110 md:h-32 md:w-64"
            src={
              props.album.thumbnailImageURL
                ? props.album.thumbnailImageURL
                : props.works.length > 0
                  ? props.works[0].smallThumbnailImageURL
                  : ""
            }
            alt={props.album.title}
          />
          <div className="absolute right-0 bottom-0 left-0 box-border h-8 bg-gradient-to-t from-black to-transparent p-4 pb-3 opacity-80">
            <p className="absolute bottom-1 left-1 text-white">
              {props.album.title}
            </p>
          </div>
          {props.album.worksCount !== undefined &&
            props.album.worksCount !== 0 && (
              <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                <Images className="h-3 w-3 text-white" />
                <div className="font-bold text-white text-xs">
                  {props.album.worksCount}
                </div>
              </div>
            )}
        </Link>
      </div>
    </div>
  )
}

export const AlbumItemFragment = graphql(
  `fragment AlbumItemFields on AlbumNode @_unmask {
    id
    slug
    user {
      id
      login
    }
    title
    thumbnailImageURL
    worksCount
    rating
  }`,
)

export const AlbumItemWorkFragment = graphql(
  `fragment AlbumItemWorkFields on WorkNode  @_unmask {
    id
    smallThumbnailImageURL
  }`,
)
