import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { Heart, Images } from "lucide-react"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
  size?: "small" | "large"
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoWorksAlbum = (props: Props) => {
  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work) => ({
          key: work.id,
          src:
            props.size === "large"
              ? work.largeThumbnailImageURL
              : work.smallThumbnailImageURL,
          width:
            props.size === "large"
              ? work.largeThumbnailImageWidth
              : work.smallThumbnailImageWidth,
          height:
            props.size === "large"
              ? work.largeThumbnailImageHeight
              : work.smallThumbnailImageHeight,
          context: work,
        }))}
        targetRowHeight={180}
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [
            { viewport: "(max-width: 960px)", size: "100vw" },
            {
              viewport: "(min-width: 960px) and (max-width: 1200px)",
              size: "calc(100vw - 240px)",
            },
            { viewport: "(min-width: 1200px)", size: "calc(100vw - 320px)" },
          ],
        }}
        render={{
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-1 bottom-16 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.context.id}
                  targetWorkOwnerUserId={photo.context.user.id}
                  defaultLiked={photo.context.isLiked}
                  defaultLikedCount={photo.context.likesCount}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  likedCount={photo.context.likesCount}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden">
                <Link
                  className="w-48 font-bold"
                  to={`/posts/${photo.context.id}`}
                >
                  <p className="overflow-hidden truncate text-nowrap text-base">
                    {photo.context.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.context.user.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={IconUrl(photo.context.user.iconUrl)}
                        alt={photo.context.user.name}
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="block max-w-16 overflow-hidden text-ellipsis text-nowrap font-bold text-sm ">
                        {photo.context.user.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
                      <span className="text-xs">
                        {photo.context.likesCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ),
          link(props) {
            return (
              <div
                style={props.style}
                className={props.className}
                aria-label={props["aria-label"]}
                role={props.role}
              >
                {props.children}
              </div>
            )
          },
          image(props, context) {
            return (
              <Link
                to={`/posts/${context.photo.context.id}`}
                className="block overflow-hidden rounded"
              >
                <img
                  {...props}
                  alt={props.alt}
                  className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                />
                {context.photo.context.subWorksCount > 0 && (
                  <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <Images className="h-3 w-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {context.photo.context.subWorksCount + 1}
                    </div>
                  </div>
                )}
              </Link>
            )
          },
        }}
      />
    </SSR>
  )
}

/**
 * TODO_2024_09: 不要なフィールドを削除する
 */
export const PhotoAlbumWorkFragment = graphql(
  `fragment PhotoAlbumWork on WorkNode @_unmask {
    id
    title
    accessType
    adminAccessType
    type
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    rating
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    type
    prompt
    negativePrompt
    isLiked
    thumbnailImagePosition
    description
    url
    subWorksCount
    tags {
      name
    }
    user {
      id
      name
      iconUrl
    }
    uuid
  }`,
)
