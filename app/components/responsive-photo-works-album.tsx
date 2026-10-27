import { type FragmentOf, graphql } from "gql.tada"
import { Link } from "@remix-run/react"
import { Heart, Images, MessageCircle } from "lucide-react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { HoverVideoImage } from "~/components/hover-video-image"
import { LikeButton } from "~/components/like-button"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { Badge } from "~/components/ui/badge"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { cn } from "~/lib/utils"
import { HomeCroppedWorks } from "~/routes/($lang)._main._index/components/home-cropped-works"
import { StickerButtonFragment } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { WorkCommentFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-fragment"
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
}

const isSensitiveWork = (work: FragmentOf<typeof PhotoAlbumWorkFragment>) => {
  return work.isSensitive || work.rating === "R18" || work.rating === "R18G"
}

/**
 * レスポンシブ対応の作品一覧
 */
export function ResponsivePhotoWorksAlbum(props: Props): React.ReactNode {
  const chipClassName =
    "gap-x-1 border-border/40 bg-background/70 text-foreground backdrop-blur-sm"

  if (props.compactWhenFew && props.works.length <= 4) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {props.works.map((workItem, index) => {
          return (
            <div
              key={workItem.id.toString()}
              className="relative flex min-w-0 flex-col space-y-2"
            >
              <div className="relative">
                <CroppedWorkSquare
                  isPriority={index < (props.priorityCount ?? 0)}
                  title={workItem.title}
                  workId={workItem.id}
                  subWorksCount={workItem.subWorksCount}
                  commentsCount={workItem.commentsCount}
                  imageUrl={workItem.smallThumbnailImageURL}
                  videoUrl={workItem.url}
                  streamUid={workItem.streamUid}
                  isAutoPlay={props.autoPlayVideoPreview}
                  thumbnailImagePosition={workItem.thumbnailImagePosition ?? 0}
                  size="auto"
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
                <>
                  {props.onSelect ? (
                    <button
                      type="button"
                      className="min-w-0 cursor-pointer text-left font-bold"
                      onClick={() => props.onSelect?.(workItem.id.toString())}
                      aria-label={`Open ${workItem.title}`}
                    >
                      <p className="overflow-hidden text-ellipsis text-nowrap text-sm">
                        {workItem.title}
                      </p>
                    </button>
                  ) : (
                    <Link
                      className="min-w-0 font-bold"
                      to={`/posts/${workItem.id}`}
                    >
                      <p className="overflow-hidden text-ellipsis text-nowrap text-sm">
                        {workItem.title}
                      </p>
                    </Link>
                  )}

                  {workItem.user && (
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        className="min-w-0"
                        to={`${props.userLinkPrefix || "/users"}/${workItem.user.id}`}
                      >
                        <div className="flex min-w-0 items-center space-x-2">
                          <UserAvatarWithFrame
                            alt={workItem.user.name}
                            frame={workItem.user.avatarFrame}
                            isAnimated={false}
                            sizeClassName="size-6"
                            src={withIconUrlFallback(workItem.user.iconUrl)}
                          />
                          <span className="block max-w-24 truncate text-sm">
                            {workItem.user.name}
                          </span>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center space-x-1 rounded-md bg-card p-1">
                        <Heart className="size-3 fill-gray-400 text-gray-400" />
                        <span className="text-xs">{workItem.likesCount}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
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
                      <HoverVideoImage
                        workId={work.id}
                        imageUrl={imageUrl}
                        videoUrl={work.url}
                        streamUid={work.streamUid}
                        isAutoPlay={props.autoPlayVideoPreview}
                        alt={work.title}
                        width={width}
                        height={height}
                        fetchPriority={isPriority ? "high" : undefined}
                        // PC 用の一覧はモバイルでは非表示（display: none）なので eager にしない
                        loading="lazy"
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
                      alt={work.title}
                      to={`/posts/${work.id}`}
                      width={width}
                      height={height}
                      fetchPriority={isPriority ? "high" : undefined}
                      loading="lazy"
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
                        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
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
      <div className="block md:hidden">
        <HomeCroppedWorks
          works={props.works}
          priorityCount={props.priorityCount}
          isShowProfile={true}
          hasReferenceButton={false}
          onSelect={props.onSelect}
          shouldMaskSensitiveWorks={props.shouldMaskSensitiveWorks}
        />
      </div>
    </>
  )
}

export const PhotoAlbumWorkFragment = graphql(
  `fragment PhotoAlbumWork on WorkNode @_unmask {
    id
    isMyRecommended
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
      biography
      enBiography
      login
      nanoid
      name
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      receivedLikesCount
      createdLikesCount
      createdBookmarksCount
      isMuted
      isBlocked
      promptonUser {
        id
      }
    }
    likedUsers(offset: 0, limit: 64) {
      id
      name
      iconUrl
      login
    }
    dailyTheme {
      id
      title
      dateText
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
    model
    modelHash
    generationModelId
    workModelId
    isTagEditable
    isCommentsEditable
    isLiked
    isBookmarked
    isInCollection
    isPromotion
    isGeneration
    ogpThumbnailImageUrl
    prompt
    negativePrompt
    noise
    seed
    steps
    sampler
    scale
    strength
    vae
    clipSkip
    otherGenerationParams
    pngInfo
    style
    url
    updatedAt
    dailyRanking
    weeklyRanking
    monthlyRanking
    relatedUrl
    nanoid
  }`,
)

const _userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      iconUrl
    }
  }`,
)

export const CommentListItemFragment = graphql(
  `fragment Comment on CommentNode @_unmask {
      ...WorkComment
      responses(offset: 0, limit: 128) {
        ...WorkComment
      }
  }`,
  [WorkCommentFragment],
)

const _createWorkCommentMutation = graphql(
  `mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }`,
)

const _createCommentLikeMutation = graphql(
  `mutation CreateCommentLike($input: CreateCommentLikeInput!) {
    createCommentLike(input: $input) {
      id
    }
  }`,
)

const _deleteCommentLikeMutation = graphql(
  `mutation DeleteCommentLike($input: DeleteCommentLikeInput!) {
    deleteCommentLike(input: $input) {
      id
    }
  }`,
)

const _viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        iconUrl
      }
      userStickers(offset: 0, limit: 5, orderBy: DATE_USED) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)
