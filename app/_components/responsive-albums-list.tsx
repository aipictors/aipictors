import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { config } from "@/config"
import { Link } from "@remix-run/react"
import { graphql, type ResultOf } from "gql.tada"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  albums: NonNullable<ResultOf<typeof albumsQuery>["albums"]> | null
  targetRowHeight?: number
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsiveAlbumsList = (props: Props) => {
  if (props.albums === null || props.albums.length === 0) {
    return null
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)
  return (
    <div className="flex flex-wrap">
      {props.albums.map((album) => (
        <div
          key={album.id}
          className="m-2 h-16 w-32 overflow-hidden rounded-md md:h-32 md:w-64"
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
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export const albumsQuery = graphql(
  `query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }`,
  [partialAlbumFieldsFragment, partialUserFieldsFragment],
)
