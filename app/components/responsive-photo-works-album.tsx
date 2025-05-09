import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import SSR from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { Heart, Images, MessageCircle } from "lucide-react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { cn } from "~/lib/utils"
import { HomeCroppedWorks } from "~/routes/($lang)._main._index/components/home-cropped-works"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
  size?: "small" | "medium" | "large"
  isShowProfile?: boolean
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
                {workItem.subWorksCount > 0 && (
                  <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <Images className="size-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {workItem.subWorksCount + 1}
                    </div>
                  </div>
                )}
                {workItem.commentsCount > 0 && (
                  <div className="absolute top-1 left-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <MessageCircle className="size-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {workItem.commentsCount}
                    </div>
                  </div>
                )}
                <div className="absolute right-0 bottom-0">
                  <LikeButton
                    size={56}
                    targetWorkId={workItem.id}
                    targetWorkOwnerUserId={workItem.user?.id ?? ""}
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
    <>
      <div className="hidden md:block">
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
                  <div className="absolute top-0 z-10 w-full rounded-md">
                    <Link
                      className="block h-full w-full overflow-hidden rounded"
                      to={`/posts/${photo.context.id}`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.context.title}
                        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div
                    className={cn(
                      "absolute right-0 z-10",
                      props.isShowProfile ? "bottom-14" : "bottom-0",
                    )}
                  >
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
                  {photo.context.subWorksCount > 0 && (
                    <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                      <Images className="size-3 text-white" />
                      <div className="font-bold text-white text-xs">
                        {photo.context.subWorksCount + 1}
                      </div>
                    </div>
                  )}
                  {photo.context.commentsCount > 0 && (
                    <div className="absolute top-1 left-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                      <MessageCircle className="size-3 text-white" />
                      <div className="font-bold text-white text-xs">
                        {photo.context.commentsCount}
                      </div>
                    </div>
                  )}
                  {props.isShowProfile && (
                    <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                      <Link
                        className="w-48 font-bold"
                        to={`/posts/${photo.context.id}`}
                      >
                        <p className="overflow-hidden text-ellipsis text-nowrap text-sm">
                          {photo.context.title}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between">
                        <Link to={`/users/${photo.context.user?.id}`}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="size-6">
                              <AvatarImage
                                className="size-6 rounded-full"
                                src={withIconUrlFallback(
                                  photo.context.user?.iconUrl,
                                )}
                                alt=""
                              />
                              <AvatarFallback />
                            </Avatar>
                            <span className="truncate text-sm">
                              {photo.context.user?.name}
                            </span>
                          </div>
                        </Link>
                        <div className="absolute right-0 ml-auto flex items-center space-x-1 rounded-md bg-card p-1">
                          <Heart className="size-3 fill-gray-400 text-gray-400" />
                          <span className="text-xs">
                            {photo.context.likesCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ),
              // ),
              // ),
              // link: (props, context) => (
              //   <Link to={`/posts/${context.photo.context.id}`} {...props} />
              // ),
              // image(props, context) {
              //   return (
              //     <Link
              //       className="block overflow-hidden rounded"
              //       to={`/posts/${context.photo.context.id}`}
              //     >
              //       <img
              //         {...props}
              //         alt={props.alt}
              //         className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
              //       />
              //     </Link>
              //   )
              // },
            }}
          />
        </SSR>
      </div>
      <div className="block md:hidden">
        <HomeCroppedWorks works={props.works} isShowProfile={true} />
      </div>
    </>
  )
}

export const PhotoAlbumWorkFragment = graphql(
  `fragment PhotoAlbumWork on WorkNode @_unmask {
    id
    title
    enTitle
    description
    likesCount
    isLiked
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    thumbnailImagePosition
    subWorksCount
    commentsCount
    user {
      id
      name
      iconUrl
    }
  }`,
)
