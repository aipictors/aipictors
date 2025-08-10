import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import SSR from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { Heart, Images, MessageCircle } from "lucide-react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { cn } from "~/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { OptimizedImage } from "~/components/optimized-image"
import { ReferenceGenerationButton } from "~/routes/($lang)._main._index/components/reference-generation-button"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { WorkMediaBadge } from "~/components/work-media-badge"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
  size?: "small" | "medium" | "large"
  isShowProfile?: boolean
  /** 作品クリック時に index を返す。未指定なら従来通りリンク遷移 */
  onSelect?: (index: string) => void
}

/**
 * 生成作品セクション専用のレスポンシブ対応作品一覧
 * 各サムネイル下に参照生成ボタンが表示される
 */
export function ResponsivePhotoWorksAlbumWithGenerationButton(props: Props) {
  if (props.works.length <= 2) {
    return (
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-8">
        {props.works.map((workItem, _index) => {
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
                  isPromptPublic={workItem.promptAccessType === "PUBLIC"}
                  hasVideoUrl={Boolean(workItem.url)}
                  isGeneration={workItem.isGeneration}
                  hasReferenceButton={true}
                />
                {workItem.subWorksCount > 0 && (
                  <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                    <Images className="size-3 text-white" />
                    <div className="font-bold text-white text-xs">
                      {workItem.subWorksCount + 1}
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
              {/* 参照生成ボタンを追加 */}
              <div className="w-full">
                <ReferenceGenerationButton workId={workItem.id} />
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
              id: work.id.toString(),
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
            targetRowHeight={
              props.targetRowHeight !== undefined
                ? props.targetRowHeight
                : props.direction === "rows"
                  ? 160
                  : 220
            }
            sizes={{
              size: "calc(100vw - 240px)",
              sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
            }}
            componentsProps={{
              image: { loading: "lazy" },
            }}
            render={{
              image: (imageProps, { photo }) => (
                <div className="relative h-full w-full overflow-hidden rounded">
                  {props.onSelect ? (
                    <button
                      type="button"
                      className="block h-full w-full cursor-pointer overflow-hidden rounded"
                      onClick={() => props.onSelect?.(photo.id)}
                      aria-label={`Open ${photo.context.title}`}
                    >
                      <OptimizedImage
                        src={imageProps.src}
                        alt={photo.context.title}
                        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                        width={
                          typeof imageProps.width === "string"
                            ? Number.parseInt(imageProps.width)
                            : imageProps.width
                        }
                        height={
                          typeof imageProps.height === "string"
                            ? Number.parseInt(imageProps.height)
                            : imageProps.height
                        }
                        loading={imageProps.loading as "lazy" | "eager"}
                      />
                    </button>
                  ) : (
                    <Link
                      className="block h-full w-full overflow-hidden rounded"
                      to={`/posts/${photo.context.id}`}
                    >
                      <OptimizedImage
                        src={imageProps.src}
                        alt={photo.context.title}
                        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                        width={
                          typeof imageProps.width === "string"
                            ? Number.parseInt(imageProps.width)
                            : imageProps.width
                        }
                        height={
                          typeof imageProps.height === "string"
                            ? Number.parseInt(imageProps.height)
                            : imageProps.height
                        }
                        loading={imageProps.loading as "lazy" | "eager"}
                      />
                    </Link>
                  )}
                  <div
                    className={cn(
                      "absolute right-0 z-10",
                      props.isShowProfile ? "bottom-28" : "bottom-0",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
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
                  {/* プロンプト公開・動画バッジ */}
                  <div className="absolute bottom-32 left-1 z-10">
                    <WorkMediaBadge
                      isPromptPublic={
                        photo.context.promptAccessType === "PUBLIC" ||
                        photo.context.isGeneration
                      }
                      hasVideoUrl={Boolean(photo.context.url)}
                      isGeneration={photo.context.isGeneration}
                      hasReferenceButton={true}
                      size="md"
                    />
                  </div>
                  {props.isShowProfile && (
                    <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                      {props.onSelect ? (
                        <button
                          type="button"
                          className="w-48 cursor-pointer font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            props.onSelect?.(photo.context.id.toString())
                          }}
                          aria-label={`Open ${photo.context.title}`}
                        >
                          <p className="overflow-hidden text-ellipsis text-nowrap text-left text-sm">
                            {photo.context.title}
                          </p>
                        </button>
                      ) : (
                        <Link
                          className="w-48 font-bold"
                          to={`/posts/${photo.context.id}`}
                        >
                          <p className="overflow-hidden text-ellipsis text-nowrap text-left text-sm">
                            {photo.context.title}
                          </p>
                        </Link>
                      )}

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

                      {/* 参照生成ボタンを追加 */}
                      <div className="mt-2 w-full">
                        <ReferenceGenerationButton workId={photo.context.id} />
                      </div>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </SSR>
      </div>
      <div className="block md:hidden">
        <HomeCroppedWorksWithGenerationButton
          works={props.works}
          isShowProfile={true}
        />
      </div>
    </>
  )
}

/**
 * モバイル用のクロップ済み作品一覧（参照生成ボタン付き）
 */
function HomeCroppedWorksWithGenerationButton(props: {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 pr-4 pb-4 md:grid-cols-3">
      {props.works.map((work) => (
        <div key={work.id} className="flex flex-col space-y-2">
          <div className="relative">
            <CroppedWorkSquare
              workId={work.id}
              imageUrl={work.smallThumbnailImageURL}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              size="sm"
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              subWorksCount={work.subWorksCount}
              isPromptPublic={
                work.promptAccessType === "PUBLIC" || work.isGeneration
              }
              hasVideoUrl={Boolean(work.url)}
              isGeneration={work.isGeneration}
              hasReferenceButton={true}
            />
            {work.subWorksCount > 0 && (
              <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                <Images className="size-3 text-white" />
                <div className="font-bold text-white text-xs">
                  {work.subWorksCount + 1}
                </div>
              </div>
            )}
            {work.commentsCount > 0 && (
              <div className="absolute top-1 left-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                <MessageCircle className="size-3 text-white" />
                <div className="font-bold text-white text-xs">
                  {work.commentsCount}
                </div>
              </div>
            )}
            <div className="absolute right-0 bottom-0">
              <LikeButton
                size={56}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user?.id ?? ""}
                defaultLiked={work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
              />
            </div>
          </div>

          {props.isShowProfile && (
            <div className="flex flex-col space-y-1">
              <Link to={`/posts/${work.id}`}>
                <p className="line-clamp-2 text-sm">{work.title}</p>
              </Link>
              <Link to={`/users/${work.user?.id}`}>
                <div className="flex items-center space-x-2">
                  <Avatar className="size-4">
                    <AvatarImage
                      className="size-4 rounded-full"
                      src={withIconUrlFallback(work.user?.iconUrl)}
                      alt={work.user?.name}
                    />
                    <AvatarFallback />
                  </Avatar>
                  <span className="truncate text-xs">{work.user?.name}</span>
                </div>
              </Link>
            </div>
          )}

          {/* 参照生成ボタンを追加 */}
          <div className="w-full">
            <ReferenceGenerationButton workId={work.id} className="text-xs" />
          </div>
        </div>
      ))}
    </div>
  )
}
