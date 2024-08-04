import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { Heart, Images } from "lucide-react"

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
          ket: work.id,
          src: work.smallThumbnailImageURL,
          width: work.smallThumbnailImageWidth,
          height: work.smallThumbnailImageHeight,
          workId: work.id, // 各作品のID
          userId: work.user.id, // 作品の所有者のID
          userIcon: IconUrl(work.user?.iconUrl), // 作品の所有者のアイコン
          userName: work.user.name, // 作品の所有者の名前
          workOwnerUserId: work.user.id,
          isLiked: work.isLiked,
          title: work.title,
          isSensitive: work.rating === "R18" || work.rating === "R18G",
          subWorksCount: work.subWorksCount,
          to: `/posts/${work.id}`,
          href: `/posts/${work.id}`,
          likesCount: work.likesCount,
        }))}
        targetRowHeight={180}
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        render={{
          // TODO: コンポーネントを分ける
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-1 bottom-16 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.workId}
                  targetWorkOwnerUserId={photo.userId}
                  defaultLiked={photo.isLiked}
                  defaultLikedCount={photo.likesCount}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  likedCount={photo.likesCount}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden">
                <Link className="w-48 font-bold" to={`/posts/${photo.workId}`}>
                  <p className="overflow-hidden truncate text-nowrap text-base">
                    {photo.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.userId}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={IconUrl(photo.userIcon)}
                        alt={photo.userName}
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="block max-w-16 overflow-hidden text-ellipsis text-nowrap font-bold text-sm ">
                        {photo.userName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
                      <span className="text-xs">{photo.likesCount}</span>
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
                to={context.photo.href}
                className="block overflow-hidden rounded"
              >
                <img
                  {...props}
                  alt={props.alt}
                  className="transition-transform duration-300 ease-in-out hover:scale-105"
                />
                {context.photo.subWorksCount > 0 && (
                  <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <Images className="h-3 w-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {context.photo.subWorksCount + 1}
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
