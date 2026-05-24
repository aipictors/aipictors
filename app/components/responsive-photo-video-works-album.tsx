import { type FragmentOf, graphql } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import SSR from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { Heart } from "lucide-react"
import { LikeButton } from "~/components/like-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof PhotoAlbumVideoWorkFragment>[]
  targetRowHeight?: number
  isAutoPlay?: boolean
}

/**
 * レスポンシブ対応の作品一覧
 */
export function ResponsivePhotoVideoWorksAlbum(props: Props): React.ReactNode {
  if (props.works.length === 1) {
    return (
      <div className="relative transition-all" style={{ position: "relative" }}>
        <div className="relative inline-block h-full w-full">
          <Link
            to={`/posts/${props.works[0].id}`}
            className="max-h-32 overflow-hidden rounded"
          >
            <img
              src={props.works[0].smallThumbnailImageURL}
              alt={props.works[0].title}
              className="max-h-72 w-full overflow-hidden rounded object-contain"
            />

            <div className="absolute top-1 left-1 opacity-50">
              <Badge variant={"secondary"} className="text-xs">
                {"video"}
              </Badge>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work, _index) => ({
          key: work.id,
          src: work.smallThumbnailImageURL,
          url: work.url,
          streamUid: work.streamUid,
          width: work.smallThumbnailImageWidth,
          height: work.smallThumbnailImageHeight,
          context: work,
        }))}
        targetRowHeight={
          props.targetRowHeight !== undefined ? props.targetRowHeight : 240
        }
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        render={{
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-1 bottom-12 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.context.id}
                  targetWorkOwnerUserId={photo.context.user?.id ?? ""}
                  defaultLiked={photo.context.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  likedCount={photo.context.likesCount}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                <Link
                  className="w-48 font-bold"
                  to={`/posts/${photo.context.id}`}
                >
                  <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
                    {photo.context.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.context.user?.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="size-4">
                        <AvatarImage
                          className="size-4 rounded-full"
                          src={withIconUrlFallback(photo.context.user?.iconUrl)}
                          alt={photo.context.user?.name}
                        />
                        <AvatarFallback />
                      </Avatar>
                      <span className="block text-nowrap font-bold text-sm ">
                        {photo.context.user?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1">
                        <Heart className="size-3 fill-gray-400 text-gray-400" />
                        <span className="text-xs">
                          {photo.context.likesCount}
                        </span>
                      </div>
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
                role={props.role}
                title={props["aria-label"]}
              >
                {props.children}
              </div>
            )
          },
          image(props, context) {
            return (
              <div
                className="relative transition-all"
                style={{ position: "relative" }}
              >
                <div className="relative inline-block h-full w-full">
                  <Link
                    to={`/posts/${context.photo.context.id}`}
                    className="overflow-hidden rounded"
                  >
                    <img
                      {...props}
                      alt={props.alt}
                      className="h-full w-full overflow-hidden rounded"
                    />

                    <div className="absolute top-1 left-1 opacity-50">
                      <Badge variant={"secondary"} className="text-xs">
                        {"video"}
                      </Badge>
                    </div>
                  </Link>
                </div>
              </div>
            )
          },
        }}
      />
    </SSR>
  )
}

export const PhotoAlbumVideoWorkFragment = graphql(
  `fragment PhotoAlbumVideoWork on WorkNode @_unmask {
    id
    title
    url
    streamUid
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    smallThumbnailImageURL
    likesCount
    isLiked
    user {
      id
      name
      iconUrl
    }
  }`,
)
