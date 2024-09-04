import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { CroppedWorkSquare } from "~/components/cropped-work-square"

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
export function ResponsivePhotoWorksAlbum(props: Props) {
  if (props.works.length <= 2) {
    return (
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8">
        {props.works.map((workItem, index) => {
          return (
            <div
              key={workItem.id.toString()}
              className="relative flex flex-col space-y-2"
            >
              <div className="relative">
                <CroppedWorkSquare
                  workId={workItem.id}
                  subWorksCount={workItem.subWorksCount}
                  imageUrl={workItem.smallThumbnailImageURL}
                  thumbnailImagePosition={workItem.thumbnailImagePosition ?? 0}
                  size="lg"
                  imageWidth={workItem.smallThumbnailImageWidth}
                  imageHeight={workItem.smallThumbnailImageHeight}
                />
                <div className="absolute right-0 bottom-0">
                  <LikeButton
                    size={56}
                    targetWorkId={workItem.id}
                    targetWorkOwnerUserId={workItem.user.id}
                    defaultLiked={workItem.isLiked}
                    defaultLikedCount={0}
                    isBackgroundNone={true}
                    strokeWidth={2}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

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
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        componentsProps={{
          image: { loading: "lazy" },
        }}
        render={{
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-0 bottom-0 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.context.id}
                  targetWorkOwnerUserId={photo.context.user.id}
                  defaultLiked={photo.context.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  likedCount={photo.context.likesCount}
                />
              </div>
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
