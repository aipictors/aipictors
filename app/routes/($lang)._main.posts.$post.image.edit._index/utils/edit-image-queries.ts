import { graphql } from "gql.tada"
import {
  PostImageFormAiModelFragment,
  PostImageFormAlbumFragment,
  PostImageFormPassFragment,
  PostImageFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-image-form-input"

export const viewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID,
    $startDate: String!,
    $endDate: String!,
    $startAt: String!,
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostImageFormPass
      }
      recentlyUsedTags {
        ...PostImageFormRecentlyUsedTags
      }
    }
    albums(
      offset: $offset,
      limit: $limit,
      where: {
        ownerUserId: $ownerUserId,
        needInspected: false,
        needsThumbnailImage: false,
      }
    ) {
      ...PostImageFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostImageFormAiModel
    }
    dailyThemes(
      limit: 8,
      offset: 0,
      where: {
        startDate: $startDate,
        endDate: $endDate,
      }) {
      id
      title
      dateText
    }
    appEvents(
      limit: 8,
      offset: 0,
      where: {
        endAt: $startAt,
      }
    ) {
      id
      description
      title
      thumbnailImageUrl
      headerImageUrl
      tag
      slug
      startAt
      endAt
    }
  }`,
  [
    PostImageFormAiModelFragment,
    PostImageFormAlbumFragment,
    PostImageFormPassFragment,
    PostImageFormRecentlyUsedTagsFragment,
  ],
)

export const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      uuid
      isMyRecommended
      title
      accessType
      type
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
      ogpThumbnailImageUrl
      tagNames
      createdAt
      model
      modelHash
      generationModelId
      workModelId
      isTagEditable
      isCommentsEditable
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
      relatedUrl
      isBotGradingEnabled
      botEvaluationStatus
      isBotGradingPublic
      isBotGradingRankingEnabled
      user {
        id
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
      album {
        id
      }
      dailyTheme {
        id
        title
      }
      subWorks {
        id
        imageUrl
      }
      adminAccessType
      moderatorReport {
        id
        status
        reportMessage
        reportType
      }
    }
  }`,
)

export const updateWorkMutation = graphql(
  `mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
      rating
      accessType
      nanoid
      uuid
      isBotGradingPublic
      isBotGradingRankingEnabled
    }
  }`,
)
