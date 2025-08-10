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
import { WorkCommentFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment"
import { StickerButtonFragment } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { OptimizedImage } from "~/components/optimized-image"

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
 * レスポンシブ対応の作品一覧
 */
export function ResponsivePhotoWorksAlbum(props: Props) {
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
                    isTargetUserBlocked={workItem.user?.isBlocked ?? false}
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
              photo: ({ photo, imageProps }) => (
                <div className="relative h-full w-full overflow-hidden rounded">
                  {props.onSelect ? (
                    <div
                      className="block h-full w-full cursor-pointer overflow-hidden rounded"
                      onClick={() => props.onSelect?.(photo.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          props.onSelect?.(photo.id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open ${photo.context.title}`}
                    >
                      <OptimizedImage
                        {...imageProps}
                        alt={photo.context.title}
                        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </div>
                  ) : (
                    <Link
                      className="block h-full w-full overflow-hidden rounded"
                      to={`/posts/${photo.context.id}`}
                    >
                      <OptimizedImage
                        {...imageProps}
                        alt={photo.context.title}
                        className="h-full w-full transition-transform duration-300 ease-in-out hover:scale-105"
                      />
                    </Link>
                  )}
                  <div
                    className={cn(
                      "absolute right-0 z-10",
                      props.isShowProfile ? "bottom-14" : "bottom-0",
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
                  {props.isShowProfile && (
                    <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                      {props.onSelect ? (
                        <div
                          className="w-48 cursor-pointer font-bold"
                          onClick={(e) => {
                            e.stopPropagation()
                            props.onSelect?.(photo.context.id.toString())
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              props.onSelect?.(photo.context.id.toString())
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open ${photo.context.title}`}
                        >
                          <p className="overflow-hidden text-ellipsis text-nowrap text-left text-sm">
                            {photo.context.title}
                          </p>
                        </div>
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
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </SSR>
      </div>
      <div className="block md:hidden">
        <HomeCroppedWorks works={props.works} isShowProfile={true} hasReferenceButton={false} />
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
