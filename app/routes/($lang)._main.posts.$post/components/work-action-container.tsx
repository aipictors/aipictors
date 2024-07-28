import { WorkAction } from "~/routes/($lang)._main.posts.$post/components/work-action"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { subWorkFieldsFragment } from "~/graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "~/graphql/fragments/user-fields"
import { graphql } from "gql.tada"

type Props = {
  title?: string
  imageUrl?: string
  workLikesCount: number
  targetWorkId: string
  targetWorkOwnerUserId: string
  bookmarkFolderId: string | null
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkActionContainer = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data } = useSuspenseQuery(workQuery, {
    skip: appContext.isLoading,
    variables: {
      id: props.targetWorkId,
    },
  })

  const isLiked = data?.work?.isLiked ?? false

  const isBookmarked = data?.work?.isBookmarked ?? false

  const isHideEditButton =
    data?.work?.type === "COLUMN" || data?.work?.type === "NOVEL"

  return (
    <WorkAction
      workLikesCount={props.workLikesCount}
      title={props.title}
      imageUrl={props.imageUrl}
      defaultLiked={isLiked}
      defaultBookmarked={isBookmarked}
      bookmarkFolderId={props.bookmarkFolderId}
      targetWorkId={props.targetWorkId}
      targetWorkOwnerUserId={props.targetWorkOwnerUserId}
      isHideEditButton={isHideEditButton}
      isRecommended={data?.work?.isMyRecommended ?? false}
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
        promptonUser {
          id
        }
        ...UserFields
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
      likedUsers(offset: 0, limit: 32) {
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
        ...SubWorkFields
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
      html
      updatedAt
      dailyRanking
      weeklyRanking
      monthlyRanking
      relatedUrl
      nanoid
    }
  }`,
  [userFieldsFragment, subWorkFieldsFragment],
)
