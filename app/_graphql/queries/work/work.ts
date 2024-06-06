import { gql } from "@/_graphql/__generated__"

export const workQuery = gql(`
  query Work($id: ID!) {
    work(id: $id) {
      id
      title
      accessType
      adminAccessType
      promptAccessType
      rating
      description
      isSensitive
      imageURL
      largeThumbnailImageURL
      largeThumbnailImageWidth
      largeThumbnailImageHeight
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
      user {
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
        }
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
      isTagEditable
      isLiked
      isInCollection
      isPromotion
      isGeneration
      prompt
      negativePrompt
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
      updatedAt
      dailyRanking
      weeklyRanking
      monthlyRanking
      relatedUrl
    }
  }
`)
