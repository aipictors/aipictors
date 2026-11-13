import type { FragmentOf } from "gql.tada"
import { Heart, Images, MessageCircle } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { OptimizedImage } from "~/components/optimized-image"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Badge } from "~/components/ui/badge"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { useGridLayout } from "~/hooks/use-grid-layout"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { ReferenceGenerationButton } from "~/routes/($lang)._main._index/components/reference-generation-button"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import {
  type GridColumnBreakpoint,
  incompleteRowHiddenClassName,
} from "~/utils/grid-layout"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/** PC で正方形に並べるときの列数: md:4 / xl:5 / 2xl:6（スマホは下の 2 列の一覧） */
const DESKTOP_SQUARE_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 4, hiddenClassName: "md:max-xl:hidden" },
  { columns: 5, hiddenClassName: "xl:max-2xl:hidden" },
  { columns: 6, hiddenClassName: "2xl:hidden" },
]

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
  const t = useTranslation()
  const { gridLayout } = useGridLayout()
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
                  title={t.workTitle(workItem.title, workItem.enTitle)}
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

  const mobileList = (
    <div className="block md:hidden">
      <HomeCroppedWorksWithGenerationButton
        works={props.works}
        isShowProfile={true}
        onSelect={props.onSelect}
      />
    </div>
  )

  if (gridLayout === "square") {
    return (
      <>
        {/* 正方形で格子状に並べる。最後の行の半端な作品は隠して行を埋める */}
        <div className="hidden gap-x-3 gap-y-4 md:grid md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {props.works.map((work, index) => (
            <div
              key={work.id}
              className={cn(
                "flex min-w-0 flex-col gap-1.5",
                incompleteRowHiddenClassName(
                  index,
                  props.works.length,
                  DESKTOP_SQUARE_BREAKPOINTS,
                ),
              )}
            >
              <div className="relative">
                <CroppedWorkSquare
                  title={t.workTitle(work.title, work.enTitle)}
                  workId={work.id}
                  subWorksCount={work.subWorksCount}
                  commentsCount={work.commentsCount}
                  imageUrl={work.smallThumbnailImageURL}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="auto"
                  displayWidth="(min-width: 1536px) 15vw, (min-width: 1280px) 18vw, 23vw"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
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
                <div className="flex min-w-0 flex-col gap-1">
                  {props.onSelect ? (
                    <button
                      type="button"
                      className="min-w-0 cursor-pointer text-left font-bold"
                      onClick={() => props.onSelect?.(work.id.toString())}
                      aria-label={`Open ${t.workTitle(work.title, work.enTitle)}`}
                    >
                      <p className="truncate text-sm">
                        {t.workTitle(work.title, work.enTitle)}
                      </p>
                    </button>
                  ) : (
                    <Link
                      className="min-w-0 font-bold hover:underline"
                      to={`/posts/${work.id}`}
                    >
                      <p className="truncate text-sm">
                        {t.workTitle(work.title, work.enTitle)}
                      </p>
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
                    <div
                      data-list-like-count
                      className="flex shrink-0 items-center gap-1 text-muted-foreground"
                    >
                      <Heart className="size-3 fill-current" />
                      <span className="text-xs tabular-nums">
                        {work.likesCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <ReferenceGenerationButton workId={work.id} />
            </div>
          ))}
        </div>
        {mobileList}
      </>
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
                alt={t.workTitle(work.title, work.enTitle)}
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
                      aria-label={`Open ${t.workTitle(work.title, work.enTitle)}`}
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
                        work.promptAccessType === "PUBLIC" || work.isGeneration
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
                        aria-label={`Open ${t.workTitle(work.title, work.enTitle)}`}
                      >
                        <p className="truncate text-sm">
                          {t.workTitle(work.title, work.enTitle)}
                        </p>
                      </button>
                    ) : (
                      <Link
                        className="min-w-0 font-bold hover:underline"
                        to={`/posts/${work.id}`}
                      >
                        <p className="truncate text-sm">
                          {t.workTitle(work.title, work.enTitle)}
                        </p>
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
                      <div
                        data-list-like-count
                        className="flex shrink-0 items-center gap-1 text-muted-foreground"
                      >
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
      {mobileList}
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
  const t = useTranslation()
  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

  // ほかの作品一覧（HomeCroppedWorks のスマホ表示）と同じ格子・余白・正方形の大きさにする。
  // 以前は正方形が固定 160px（size="lg"）で、2 列のマスより小さく右と下に余白が出ていた
  return (
    <div className="safari-work-grid grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3">
      {props.works.map((work) => (
        <div key={work.id} className="relative flex w-full min-w-0 flex-col">
          <div className="relative">
            <CroppedWorkSquare
              title={t.workTitle(work.title, work.enTitle)}
              workId={work.id}
              imageUrl={work.smallThumbnailImageURL}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              size="auto"
              media="(max-width: 767.98px)"
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
            <div className="absolute right-2 bottom-2 z-10">
              <LikeButton
                size={56}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.user?.id ?? ""}
                defaultLiked={work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
                isParticle={true}
              />
            </div>
          </div>

          {props.isShowProfile && work.user && (
            <>
              {props.onSelect ? (
                <button
                  type="button"
                  onClick={() => props.onSelect?.(work.id)}
                  className="mt-1.5 min-w-0 cursor-pointer text-left"
                >
                  <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-sm">
                    {t.workTitle(work.title, work.enTitle)}
                  </p>
                </button>
              ) : (
                <Link className="mt-1.5 min-w-0" to={`/posts/${work.id}`}>
                  <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-sm">
                    {t.workTitle(work.title, work.enTitle)}
                  </p>
                </Link>
              )}
              <UserNameBadge
                userId={work.user.id}
                frame={work.user.avatarFrame}
                userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                name={work.user.name}
                width={"md"}
                likesCount={work.likesCount}
              />
            </>
          )}

          {/* 参照生成ボタン */}
          <div className="mt-1.5 w-full">
            <ReferenceGenerationButton workId={work.id} className="text-xs" />
          </div>
        </div>
      ))}
    </div>
  )
}
