import { type FragmentOf, graphql } from "gql.tada"
import { Heart, Images, MessageCircle } from "lucide-react"
import { Fragment } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { HoverVideoImage } from "~/components/hover-video-image"
import { LikeButton } from "~/components/like-button"
import { Badge } from "~/components/ui/badge"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { WorkPromotionMark } from "~/components/work/work-promotion"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { useGridLayout } from "~/hooks/use-grid-layout"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { HomeCroppedWorks } from "~/routes/($lang)._main._index/components/home-cropped-works"
import {
  type GridLayout,
  incompleteRowHiddenClassName,
  SQUARE_GRID_BREAKPOINTS,
} from "~/utils/grid-layout"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
  priorityCount?: number
  size?: "small" | "medium" | "large"
  isShowProfile?: boolean
  compactWhenFew?: boolean
  autoPlayVideoPreview?: boolean
  /** 作品クリック時に index を返す。未指定なら従来通りリンク遷移 */
  onSelect?: (index: string) => void
  /** ユーザリンクのプレフィックス（例: "/users" または "/posts/gallery/users"） */
  userLinkPrefix?: string
  shouldMaskSensitiveWorks?: boolean
  /**
   * 並べ方を固定する。省略時は利用者の設定（正方形／元の比率、app/hooks/use-grid-layout.ts）
   */
  layout?: GridLayout
  /** 正方形のとき、最後の行の半端な作品を隠して行をぴったり埋める（ホームの一覧など、続きを読まない一覧で使う） */
  fillRows?: boolean
  /** 作品の画像の上に重ねるもの（おすすめの「興味なし」など） */
  renderItemOverlay?: (workId: string) => React.ReactNode
  /**
   * 正方形のとき、index 番目の作品の後ろに横幅いっぱいの欄を差し込む（おすすめの途中の棚など）。
   * 差し込んだ欄の手前の行が埋まらないときは、後ろの作品を詰めて穴を空けない
   */
  renderAfterItem?: (index: number) => React.ReactNode
}

/** 正方形で並べるときの列数（スマホ 2・PC は画面幅に合わせて 4〜6） */
const SQUARE_GRID_CLASS =
  "grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"

/** 上の列数に合わせた画像の表示幅（sizes） */
const SQUARE_GRID_SIZES =
  "(min-width: 1536px) 15vw, (min-width: 1280px) 18vw, (min-width: 768px) 23vw, (min-width: 640px) 31vw, 48vw"

const isSensitiveWork = (work: FragmentOf<typeof PhotoAlbumWorkFragment>) => {
  return work.isSensitive || work.rating === "R18" || work.rating === "R18G"
}

/**
 * レスポンシブ対応の作品一覧
 */
export function ResponsivePhotoWorksAlbum(props: Props): React.ReactNode {
  const t = useTranslation()
  const { showDesktop, showMobile } = useLayoutVariant()
  const { gridLayout } = useGridLayout()
  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

  const isFew = props.compactWhenFew === true && props.works.length <= 4
  const isSquare = (props.layout ?? gridLayout) === "square"

  if (isFew || isSquare) {
    return (
      <div
        className={cn(
          isFew
            ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
            : SQUARE_GRID_CLASS,
          // 差し込んだ欄の手前に空いたマスを、後ろの作品で埋める
          props.renderAfterItem && "grid-flow-row-dense",
        )}
      >
        {props.works.map((workItem, index) => {
          const after = props.renderAfterItem?.(index)
          return (
            <Fragment key={workItem.id.toString()}>
              <div
                data-work-id={workItem.id}
                className={cn(
                  "group/item relative flex min-w-0 flex-col gap-1.5",
                  props.fillRows &&
                    !isFew &&
                    incompleteRowHiddenClassName(
                      index,
                      props.works.length,
                      SQUARE_GRID_BREAKPOINTS,
                    ),
                )}
              >
                <div className="relative">
                  <CroppedWorkSquare
                    isPriority={index < (props.priorityCount ?? 0)}
                    isLowPriority={
                      props.priorityCount !== undefined &&
                      index >= props.priorityCount
                    }
                    title={t.workTitle(workItem.title, workItem.enTitle)}
                    workId={workItem.id}
                    subWorksCount={workItem.subWorksCount}
                    commentsCount={workItem.commentsCount}
                    imageUrl={workItem.smallThumbnailImageURL}
                    videoUrl={workItem.url}
                    streamUid={workItem.streamUid}
                    isAutoPlay={props.autoPlayVideoPreview}
                    thumbnailImagePosition={
                      workItem.thumbnailImagePosition ?? 0
                    }
                    size="auto"
                    displayWidth={isFew ? undefined : SQUARE_GRID_SIZES}
                    onSelect={props.onSelect}
                    imageWidth={workItem.smallThumbnailImageWidth}
                    imageHeight={workItem.smallThumbnailImageHeight}
                    isPromptPublic={
                      workItem.promptAccessType === "PUBLIC" ||
                      workItem.isGeneration
                    }
                    hasVideoUrl={Boolean(workItem.url || workItem.streamUid)}
                    shouldMaskSensitive={
                      props.shouldMaskSensitiveWorks === true &&
                      isSensitiveWork(workItem)
                    }
                  />
                  {workItem.isPromotion && (
                    <WorkPromotionMark className="absolute top-1.5 left-1.5" />
                  )}
                  {props.renderItemOverlay?.(workItem.id.toString())}
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
                {props.isShowProfile && (
                  <div className="flex min-w-0 flex-col gap-1">
                    {props.onSelect ? (
                      <button
                        type="button"
                        className="min-w-0 cursor-pointer text-left font-bold"
                        onClick={() => props.onSelect?.(workItem.id.toString())}
                        aria-label={`Open ${t.workTitle(workItem.title, workItem.enTitle)}`}
                      >
                        <p className="truncate text-sm">
                          {t.workTitle(workItem.title, workItem.enTitle)}
                        </p>
                      </button>
                    ) : (
                      <Link
                        className="min-w-0 font-bold hover:underline"
                        to={`/posts/${workItem.id}`}
                      >
                        <p className="truncate text-sm">
                          {t.workTitle(workItem.title, workItem.enTitle)}
                        </p>
                      </Link>
                    )}
                    {workItem.user && (
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <Link
                          className="min-w-0"
                          to={`${props.userLinkPrefix || "/users"}/${workItem.user.id}`}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <UserAvatarWithFrame
                              alt={workItem.user.name}
                              frame={workItem.user.avatarFrame}
                              isAnimated={false}
                              sizeClassName="size-5"
                              src={withIconUrlFallback(workItem.user.iconUrl)}
                            />
                            <span className="truncate text-muted-foreground text-xs">
                              {workItem.user.name}
                            </span>
                          </div>
                        </Link>
                        <div
                          data-list-like-count
                          className="flex shrink-0 items-center gap-1 text-muted-foreground"
                        >
                          <Heart className="size-3 fill-current" />
                          <span className="text-xs tabular-nums">
                            {workItem.likesCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {after !== undefined && after !== null && after !== false && (
                // 中身が無いとき（棚に作品が無いなど）は行ごと消す
                <div className="col-span-full min-w-0 space-y-4 empty:hidden">
                  {after}
                </div>
              )}
            </Fragment>
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
      {showDesktop && (
        <div className="hidden md:block">
          {/*
          行の高さを揃えて並べる（justified）レイアウトを CSS だけで行う。
          各作品の flex-grow / flex-basis を縦横比に比例させると、同じ行の作品は同じ高さになる。
          以前は react-photo-album の SSR で画面幅ごとに 4 回分の一覧を HTML に出力していたため、
          HTML が大きく（タグページで約 1MB）、ハイドレーションも重くなっていた。
        */}
          <div className="flex flex-wrap gap-x-2 gap-y-4 after:block after:grow-[1000000] after:content-['']">
            {props.works.map((work, index) => {
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
              // 極端に縦長・横長の画像で行が崩れないよう縦横比を制限する
              const ratio = Math.min(Math.max(width / height, 0.5), 2.4)
              const isPriority =
                props.priorityCount !== undefined && index < props.priorityCount
              // 表示幅は flex-basis から少し伸びる程度なので、それに合う縮小版を読む
              // （元のサムネイルは 600px 前後で、PC の一覧では倍近く大きかった）
              const srcSet = toResizedImageSrcSet(imageUrl, {
                minWidth: 160,
                maxWidth: width > 1 ? width : undefined,
              })
              const sizes = `${Math.round(ratio * targetRowHeight * 1.4)}px`
              return (
                <div
                  key={work.id}
                  data-work-id={work.id}
                  className="group/item relative min-w-0"
                  style={{
                    flexGrow: ratio * 100,
                    flexBasis: `${Math.round(ratio * targetRowHeight)}px`,
                  }}
                >
                  <div
                    className="relative w-full overflow-hidden rounded-lg bg-muted transition-shadow duration-200 hover:shadow-lg"
                    style={{ aspectRatio: `${ratio}` }}
                  >
                    {work.isPromotion && (
                      <WorkPromotionMark className="absolute top-1.5 left-1.5 z-10" />
                    )}
                    {props.renderItemOverlay?.(work.id.toString())}
                    {props.onSelect ? (
                      <button
                        type="button"
                        className="absolute inset-0 block h-full w-full cursor-pointer overflow-hidden"
                        onClick={() => props.onSelect?.(work.id.toString())}
                        aria-label={`Open ${t.workTitle(work.title, work.enTitle)}`}
                      >
                        <HoverVideoImage
                          workId={work.id}
                          imageUrl={imageUrl}
                          videoUrl={work.url}
                          streamUid={work.streamUid}
                          isAutoPlay={props.autoPlayVideoPreview}
                          alt={t.workTitle(work.title, work.enTitle)}
                          width={width}
                          height={height}
                          fetchPriority={
                            isPriority
                              ? "high"
                              : props.priorityCount !== undefined
                                ? "low"
                                : undefined
                          }
                          // PC 用の一覧はスマホでは非表示（display: none）。media でスマホでは読み込まないので、
                          // 先頭の作品は PC で優先して読み込める
                          loading={isPriority ? "eager" : "lazy"}
                          media="(min-width: 768px)"
                          srcSet={srcSet}
                          sizes={sizes}
                          className="h-full w-full"
                          shouldMaskSensitive={
                            props.shouldMaskSensitiveWorks === true &&
                            isSensitiveWork(work)
                          }
                        />
                      </button>
                    ) : (
                      <HoverVideoImage
                        workId={work.id}
                        imageUrl={imageUrl}
                        videoUrl={work.url}
                        streamUid={work.streamUid}
                        isAutoPlay={props.autoPlayVideoPreview}
                        alt={t.workTitle(work.title, work.enTitle)}
                        to={`/posts/${work.id}`}
                        width={width}
                        height={height}
                        fetchPriority={
                          isPriority
                            ? "high"
                            : props.priorityCount !== undefined
                              ? "low"
                              : undefined
                        }
                        loading={isPriority ? "eager" : "lazy"}
                        media="(min-width: 768px)"
                        srcSet={srcSet}
                        sizes={sizes}
                        className="absolute inset-0 block h-full w-full overflow-hidden"
                        shouldMaskSensitive={
                          props.shouldMaskSensitiveWorks === true &&
                          isSensitiveWork(work)
                        }
                      />
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
                        isPromptPublic={work.promptAccessType === "PUBLIC"}
                        hasVideoUrl={Boolean(work.url)}
                        isGeneration={work.isGeneration}
                        hasReferenceButton={false}
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
                      {work.user && (
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <Link
                            className="min-w-0"
                            to={`${props.userLinkPrefix || "/users"}/${work.user.id}`}
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <UserAvatarWithFrame
                                alt={work.user.name}
                                frame={work.user.avatarFrame}
                                isAnimated={false}
                                sizeClassName="size-5"
                                src={withIconUrlFallback(work.user.iconUrl)}
                              />
                              <span className="truncate text-muted-foreground text-xs">
                                {work.user.name}
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
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {showMobile && (
        <div className="block md:hidden">
          <HomeCroppedWorks
            works={props.works}
            priorityCount={props.priorityCount}
            isMobileOnly={true}
            isShowProfile={true}
            hasReferenceButton={false}
            onSelect={props.onSelect}
            shouldMaskSensitiveWorks={props.shouldMaskSensitiveWorks}
          />
        </div>
      )}
    </>
  )
}

// 一覧の作品 1 件ごとに DB を引くので、一覧で使う項目だけにする（詳細はダイアログを開くときに取り直す）
export const PhotoAlbumWorkFragment = graphql(
  `fragment PhotoAlbumWork on WorkNode @_unmask {
    id
    title
    mdUrl
    accessType
    type
    adminAccessType
    promptAccessType
    rating
    description
    isSensitive
    enTitle
    enDescription
    imageURL
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
    subWorksCount
    url
    streamUid
    isDeleted
    user {
      id
      login
      nanoid
      name
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
    tagNames
    createdAt
    likesCount
    viewsCount
    commentsCount
    subWorks {
      id
      imageUrl
    }
    isCommentsEditable
    isLiked
    isPromotion
    isGeneration
    updatedAt
    nanoid
  }`,
)
