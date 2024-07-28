import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  album: FragmentOf<typeof albumItemFragment>
  works: FragmentOf<typeof albumItemWorkFragment>[]
  targetRowHeight?: number
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsiveAlbumsList = (props: Props) => {
  return (
    <div
      key={props.album.id}
      className="m-2 h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
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
        </Link>
      </div>
    </div>
  )
}

export const albumItemFragment = graphql(
  `fragment AlbumItemFields on AlbumNode @_unmask {
    id
    slug
    user {
      id
      login
    }
    title
    thumbnailImageURL
  }`,
)

export const albumItemWorkFragment = graphql(
  `fragment AlbumItemWorkFields on WorkNode  @_unmask {
      id
      smallThumbnailImageURL
  }`,
)
