import type { FragmentOf } from "gql.tada"
import { Link } from "@remix-run/react"
import { Heart, Images, MessageCircle } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { OptimizedImage } from "~/components/optimized-image"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { Badge } from "~/components/ui/badge"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { cn } from "~/lib/utils"
import { ReferenceGenerationButton } from "~/routes/($lang)._main._index/components/reference-generation-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

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
  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

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
                  title={workItem.title}
                  workId={workItem.id}
                  subWorksCount={workItem.subWorksCount}
                  commentsCount={workItem.commentsCount}
                  imageUrl={workItem.smallThumbnailImageURL}
                  thumbnailImagePosition={workItem.thumbnailImagePosition ?? 0}
                  size="lg"
                  imageWidth={workItem.smallThumbnailImageWidth}
                  imageHeight={workItem.smallThumbnailImageHeight}
                  isPromptPublic={workItem.promptAccessType === "PUBLIC"}
                  hasVideoUrl={Boolean(workItem.url)}
                  isGeneration={workItem.isGeneration}
                  hasReferenceButton={true}
                  onSelect={props.onSelect}
                />
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

  const targetRowHeight =
    props.targetRowHeight !== undefined
      ? props.targetRowHeight
      : props.direction === "rows"
        ? 160
        : 220

  return (
    <>
      <div className="hidden md:block">
        {/* 行の高さを揃えるレイアウトを CSS だけで行う（ResponsivePhotoWorksAlbum と同じ方式） */}
        <div className="flex flex-wrap gap-x-2 gap-y-4 after:block after:grow-[1000000] after:content-['']">
          {props.works.map((work) => {
            const isLarge = props.size === "large"
            const imageUrl = isLarge
              ? work.largeThumbnailImageURL
              : work.smallThumbnailImageURL
            const width =
              (isLarge
                ? work.largeThumbnailImageWidth
                : work.smallThumbnailImageWidth) || 1
            const height =
              (isLarge
                ? work.largeThumbnailImageHeight
                : work.smallThumbnailImageHeight) || 1
            const ratio = Math.min(Math.max(width / height, 0.5), 2.4)
            const image = (
              <OptimizedImage
                src={imageUrl}
                alt={work.title}
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                width={width}
                height={height}
                loading="lazy"
              />
            )
            return (
              <div
                key={work.id}
                className="relative min-w-0"
                style={{
                  flexGrow: ratio * 100,
                  flexBasis: `${Math.round(ratio * targetRowHeight)}px`,
                }}
              >
                <div
                  className="relative w-full overflow-hidden rounded-md bg-muted"
                  style={{ aspectRatio: `${ratio}` }}
                >
                  {props.onSelect ? (
                    <button
                      type="button"
                      className="absolute inset-0 block h-full w-full cursor-pointer overflow-hidden"
                      onClick={() => props.onSelect?.(work.id.toString())}
                      aria-label={`Open ${work.title}`}
                    >
                      {image}
                    </button>
                  ) : (
                    <Link
                      className="absolute inset-0 block h-full w-full overflow-hidden"
                      to={`/posts/${work.id}`}
                    >
                      {image}
                    </Link>
                  )}
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay is not an actionable control; LikeButton handles keyboard/mouse interaction */}
                  <div
                    className="absolute right-0 bottom-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  >
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user?.id ?? ""}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      likedCount={work.likesCount}
                    />
                  </div>
                  {work.subWorksCount > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "pointer-events-none absolute top-1 right-1 z-10 flex items-center",
                        chipClassName,
                      )}
                    >
                      <Images className="size-3 text-muted-foreground" />
                      <span className="font-semibold text-xs leading-none">
                        {work.subWorksCount + 1}
                      </span>
                    </Badge>
                  )}
                  {work.commentsCount > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "pointer-events-none absolute top-1 left-1 z-10 flex items-center",
                        chipClassName,
                      )}
                    >
                      <MessageCircle className="size-3 text-muted-foreground" />
                      <span className="font-semibold text-xs leading-none">
                        {work.commentsCount}
                      </span>
                    </Badge>
                  )}
                  {/* プロンプト公開・動画バッジ */}
                  <div className="pointer-events-none absolute bottom-2 left-1 z-10">
                    <WorkMediaBadge
                      isPromptPublic={
                        (work.promptAccessType === "PUBLIC" &&
                          work.prompt !== "") ||
                        work.isGeneration
                      }
                      hasVideoUrl={Boolean(work.url)}
                      isGeneration={work.isGeneration}
                      hasReferenceButton={true}
                      size="md"
                    />
                  </div>
                </div>
                {props.isShowProfile && (
                  <div className="mt-1.5 flex min-w-0 flex-col gap-1">
                    {props.onSelect ? (
                      <button
                        type="button"
                        className="min-w-0 cursor-pointer text-left font-bold"
                        onClick={(e) => {
                          e.stopPropagation()
                          props.onSelect?.(work.id.toString())
                        }}
                        aria-label={`Open ${work.title}`}
                      >
                        <p className="truncate text-sm">{work.title}</p>
                      </button>
                    ) : (
                      <Link
                        className="min-w-0 font-bold hover:underline"
                        to={`/posts/${work.id}`}
                      >
                        <p className="truncate text-sm">{work.title}</p>
                      </Link>
                    )}
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <Link className="min-w-0" to={`/users/${work.user?.id}`}>
                        <div className="flex min-w-0 items-center gap-1.5">
                          <UserAvatarWithFrame
                            alt={work.user?.name ?? ""}
                            frame={work.user?.avatarFrame}
                            isAnimated={false}
                            sizeClassName="size-5"
                            src={withIconUrlFallback(work.user?.iconUrl)}
                          />
                          <span className="truncate text-muted-foreground text-xs">
                            {work.user?.name}
                          </span>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        <Heart className="size-3 fill-current" />
                        <span className="text-xs tabular-nums">
                          {work.likesCount}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 w-full">
                      <ReferenceGenerationButton workId={work.id} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="block md:hidden">
        <HomeCroppedWorksWithGenerationButton
          works={props.works}
          isShowProfile={true}
          onSelect={props.onSelect}
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
  onSelect?: (index: string) => void
}) {
  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

  return (
    <div className="grid w-full grid-cols-2 gap-3 pr-2 pb-4">
      {props.works.map((work) => (
        <div key={work.id} className="flex flex-col space-y-2">
          <div className="relative">
            <CroppedWorkSquare
              title={work.title}
              workId={work.id}
              imageUrl={work.smallThumbnailImageURL}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              size="lg"
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              subWorksCount={work.subWorksCount}
              commentsCount={work.commentsCount}
              isPromptPublic={
                work.promptAccessType === "PUBLIC" || work.isGeneration
              }
              hasVideoUrl={Boolean(work.url)}
              isGeneration={work.isGeneration}
              hasReferenceButton={true}
              onSelect={props.onSelect}
            />
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
              {props.onSelect ? (
                <button
                  type="button"
                  onClick={() => props.onSelect?.(work.id)}
                  className="cursor-pointer text-left"
                >
                  <p className="line-clamp-2 text-sm">{work.title}</p>
                </button>
              ) : (
                <Link to={`/posts/${work.id}`}>
                  <p className="line-clamp-2 text-sm">{work.title}</p>
                </Link>
              )}
              <Link to={`/users/${work.user?.id}`}>
                <div className="flex items-center space-x-2">
                  <UserAvatarWithFrame
                    alt={work.user?.name ?? ""}
                    frame={work.user?.avatarFrame}
                    isAnimated={false}
                    sizeClassName="size-4"
                    src={withIconUrlFallback(work.user?.iconUrl)}
                  />
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
