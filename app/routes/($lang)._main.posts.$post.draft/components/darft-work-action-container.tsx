import { WorkAction } from "~/routes/($lang)._main.posts.$post._index/components/work-action"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  title?: string
  currentImageUrl?: string
  imageUrls?: string[]
  workLikesCount: number
  targetWorkId: string
  targetWorkOwnerUserId: string
  bookmarkFolderId: string | null
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export function DraftWorkActionContainer(props: Props) {
  const appContext = useContext(AuthContext)

  const { data } = useQuery(workQuery, {
    skip: appContext.isLoading,
    variables: {
      id: props.targetWorkId,
    },
  })

  const isLiked = data?.work?.isLiked ?? false

  const isBookmarked = data?.work?.isBookmarked ?? false

  return (
    <WorkAction
      id={props.targetWorkId}
      workLikesCount={props.workLikesCount}
      title={props.title}
      currentImageUrl={props.currentImageUrl}
      imageUrls={props.imageUrls}
      defaultLiked={isLiked}
      defaultBookmarked={isBookmarked}
      bookmarkFolderId={props.bookmarkFolderId}
      targetWorkId={props.targetWorkId}
      targetWorkOwnerUserId={props.targetWorkOwnerUserId}
      isHideEditButton={false}
      isRecommended={data?.work?.isMyRecommended ?? false}
      isDisabledShare={true}
      workType={
        (data?.work?.type as "COLUMN" | "NOVEL" | "WORK" | "VIDEO") ?? "WORK"
      }
    />
  )
}

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      isMyRecommended
      title
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
      user {
        id
        biography
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
        headerImageUrl
        biography
        receivedLikesCount
        createdLikesCount
        createdBookmarksCount
        isFollower
        isFollowee
        isMuted
        works(offset: 0, limit: 16) {
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
    }
  }`,
)
