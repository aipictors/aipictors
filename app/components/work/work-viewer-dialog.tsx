import { useCallback, useEffect, useState, type WheelEvent } from "react"
import { type FragmentOf, graphql } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useQuery } from "@apollo/client/index"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { WorkArticle } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkCommentList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

// ───────────────── Types ─────────────────
interface Props {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  startIndex: number
  onClose: () => void
}

// ───────────────── Component ─────────────────
export function WorkViewerDialog({ works, startIndex, onClose }: Props) {
  // 現在インデックス
  const [index, setIndex] = useState(startIndex)
  const work = works[index]

  // GraphQL
  const { data, loading, refetch } = useQuery(workDialogQuery, {
    variables: { workId: work.id },
    fetchPolicy: "cache-and-network", // ⚡️ 即描画 → 裏で更新
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    returnPartialData: true, // 未取得フィールドは後追い
  })

  // 選択が変わったら refetch
  useEffect(() => {
    refetch({ workId: work.id })
  }, [work.id, refetch])

  // ナビゲーション関数
  const prev = useCallback(
    () => setIndex((i) => (i ? i - 1 : works.length - 1)),
    [works.length],
  )
  const next = useCallback(
    () => setIndex((i) => (i + 1) % works.length),
    [works.length],
  )

  // キー & ホイール
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
      if (e.key === "Escape") onClose()
    }
    const _onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.deltaY > 0 ? next() : prev()
      }
    }
    window.addEventListener("keydown", onKey)
    // window.addEventListener("wheel", onWheel, { passive: true })
    return () => {
      window.removeEventListener("keydown", onKey)
      // window.removeEventListener("wheel", onWheel as any)
    }
  }, [prev, next, onClose])

  const currentWork = data?.work ?? work

  // ───────────────── Render ─────────────────
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex h-[90vh] w-[100vw] max-w-[100vw] overflow-hidden p-0">
        {/* 詳細 (Desktop) */}
        <aside className="hidden w-full flex-col overflow-y-auto bg-background/80 backdrop-blur-sm md:flex">
          <DialogHeader className="border-b p-4 pb-2">
            <DialogTitle className="truncate font-bold text-lg">
              {currentWork.title}
            </DialogTitle>
            <div className="mt-2 flex items-center space-x-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={withIconUrlFallback(currentWork.user?.iconUrl)}
                />
                <AvatarFallback />
              </Avatar>
              <span className="font-medium text-sm">
                {currentWork.user?.name}
              </span>
            </div>
          </DialogHeader>

          <div className="flex w-full flex-1 flex-col gap-y-6 overflow-y-auto p-4">
            <WorkArticle work={currentWork} userSetting={undefined} />
            <WorkCommentList
              workId={currentWork.id}
              workOwnerIconImageURL={withIconUrlFallback(
                currentWork.user?.iconUrl,
              )}
              comments={
                Array.isArray(
                  (currentWork as { comments?: unknown[] }).comments,
                )
                  ? ((
                      currentWork as unknown as {
                        comments: FragmentOf<typeof WorkCommentFragment>[]
                      }
                    ).comments.map((comment) => ({
                      ...comment,
                      responses: null,
                    })) as (FragmentOf<typeof WorkCommentFragment> & {
                      responses: null
                    })[])
                  : []
              }
              defaultShowCommentCount={8}
            />
          </div>
        </aside>

        {/* サムネイル列 (Desktop) */}
        <aside className="ml-auto hidden h-full w-24 flex-col overflow-y-auto bg-background/60 backdrop-blur-sm md:flex">
          {works.map((w, i) => (
            <button
              key={w.id}
              type="button"
              className={`relative m-1 rounded-md ring-offset-2 focus:outline-none focus:ring-2 ${
                i === index ? "ring ring-primary" : ""
              }`}
              onClick={() => setIndex(i)}
            >
              <img
                src={w.smallThumbnailImageURL}
                alt={w.title}
                className="h-20 w-full object-cover"
              />
            </button>
          ))}
        </aside>
      </DialogContent>

      {/* モバイル用：画像下にキャプション */}
      <div className="px-4 pt-4 pb-8 md:hidden">
        <h2 className="truncate font-bold text-lg">{currentWork.title}</h2>
        <div className="mt-2 flex items-center space-x-2">
          <Avatar className="size-6">
            <AvatarImage src={withIconUrlFallback(currentWork.user?.iconUrl)} />
            <AvatarFallback />
          </Avatar>
          <span className="font-medium text-sm">{currentWork.user?.name}</span>
        </div>
      </div>
    </Dialog>
  )
}

export const workArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
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
      works(offset: 0, limit: 16, where: { ratings: [G, R15] }) {
        id
        userId
        largeThumbnailImageURL
        largeThumbnailImageWidth
        largeThumbnailImageHeight
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
        subWorksCount
        commentsCount
        isLiked
      }
      promptonUser {
        id
      }
    }
    likedUsers(offset: 0, limit: 120) {
      id
      name
      iconUrl
      login
    }
    album {
      id
      title
      description
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
    nextWork {
      id
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    previousWork {
      id
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
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

export const WorkCommentFragment = graphql(
  `fragment WorkComment on CommentNode @_unmask  {
    id
    createdAt
    text
    likesCount
    isWorkOwnerLiked
    isLiked
    user {
      id
      name
      login
      iconUrl
      nanoid
    }
    sticker {
      id
      imageUrl
      title
      isDownloaded
      likesCount
      usesCount
      downloadsCount
      accessType
    }
  }`,
)

// ────────── GraphQL
const workDialogQuery = graphql(
  /* GraphQL */ `
    query WorkDialog($workId: ID!) {
      work(id: $workId) {
        ...WorkArticle
        comments(offset: 0, limit: 128) {
          ...WorkComment
        }
        user {
          iconUrl
        }
      }
      viewer {
        id
        # userSetting { ...UserSetting } 
      }
    }
  `,
  [
    workArticleFragment,
    WorkCommentFragment,
    // UserSettingFragment
  ],
)
