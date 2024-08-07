import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
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
          src: work.largeThumbnailImageURL,
          width: work.largeThumbnailImageWidth,
          height: work.largeThumbnailImageHeight,
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
          // TODO: コンポーネントを分ける
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-1 bottom-12 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.context.id}
                  targetWorkOwnerUserId={photo.context.user.id}
                  defaultLiked={photo.context.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
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
                <Link to={`/users/${photo.context.user.id}`}>
                  <div className="flex items-center space-x-2">
                    <img
                      src={IconUrl(photo.context.user.iconUrl)}
                      alt={photo.context.user.name}
                      className="h-4 w-4 rounded-full"
                    />
                    <span className="text-nowrap font-bold text-sm ">
                      {photo.context.user.name}
                    </span>
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
                className="overflow-hidden"
                to={`/posts/${context.photo.context.id}`}
              >
                <img
                  className="cursor-pointer duration-500 hover:scale-105"
                  {...props}
                  alt={props.alt}
                />
              </Link>
            )
          },
        }}
      />
    </SSR>
  )
}
