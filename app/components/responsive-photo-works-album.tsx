import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { Images } from "lucide-react"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
  size?: "small" | "medium" | "large"
  isHideProfile?: boolean
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
          src: work.smallThumbnailImageURL,
          width: work.smallThumbnailImageWidth,
          height: work.smallThumbnailImageHeight,
          // workId: work.id, // 各作品のID
          // userId: work.user.id, // 作品の所有者のID
          // userIcon: IconUrl(work.user?.iconUrl), // 作品の所有者のアイコン
          // userName: work.user.name, // 作品の所有者の名前
          // workOwnerUserId: work.user.id,
          // isLiked: work.isLiked,
          // title: work.title,
          // isSensitive: work.rating === "R18" || work.rating === "R18G",
          // subWorksCount: work.subWorksCount,
          // to: `/posts/${work.id}`,
          href: `/posts/${work.id}`,
          context: work,
        }))}
        targetRowHeight={
          props.targetRowHeight !== undefined ? props.targetRowHeight : 240
        }
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        componentsProps={{
          image: { loading: "lazy" },
        }}
        render={{
          // TODO: コンポーネントを分ける
          extras: (_, { photo, index }) => (
            // typeof window === "undefined" ? (
            //   <div className="mt-2 flex flex-col space-y-2">
            //     <Skeleton className="h-4 w-full rounded-full" />
            //     <div className="flex items-center space-x-2">
            //       <Skeleton className="h-4 w-4 rounded-full" />
            //       <Skeleton className="h-4 w-full rounded-full" />
            //     </div>
            //   </div>
            // ) : (
            <div key={index}>
              <div className="absolute right-1 bottom-0 z-10">
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
              <div className="absolute top-1 right-1 z-10">
                {photo.context.subWorksCount > 0 && (
                  <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <Images className="h-3 w-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {photo.context.subWorksCount + 1}
                    </div>
                  </div>
                )}
              </div>
              {/* <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                <Link className="w-48 font-bold" to={`/posts/${photo.workId}`}>
                  <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
                    {photo.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.userId}`}>
                  <div className="flex items-center space-x-2">
                    <img
                      src={IconUrl(photo.userIcon)}
                      alt={photo.userName}
                      className="h-4 w-4 rounded-full"
                    />
                    <span className="text-nowrap font-bold text-sm ">
                      {photo.userName}
                    </span>
                  </div>
                </Link>
              </div> */}
            </div>
          ),
          // ),
          // ),
          link: (props, context) => (
            <Link to={`/posts/${context.photo.context.id}`} {...props} />
          ),
          // image(props, context) {
          //   return (
          //     <Link
          //       to={`/posts/${context.photo.context.id}`}
          //       className="block overflow-hidden rounded"
          //     >
          //       <img
          //         {...props}
          //         alt={props.alt}
          //         className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
          //       />
          //       {context.photo.context.subWorksCount > 0 && (
          //         <div className="absolute top-1 right-1 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
          //           <Images className="h-3 w-3 text-white" />
          //           <div className="font-bold text-white text-xs">
          //             {context.photo.context.subWorksCount + 1}
          //           </div>
          //         </div>
          //       )}
          //     </Link>
          //   )
          // },
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
