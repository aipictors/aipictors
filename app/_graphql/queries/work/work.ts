import { gql } from "@/_graphql/__generated__"

export const workQuery = gql(`
  query Work($id: ID!) {
    work(id: $id) {
      id
      title
      rating
      description
      imageURL
      smallThumbnailImageURL
      largeThumbnailImageURL
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
          largeThumbnailImageURL
          largeThumbnailImageWidth
          largeThumbnailImageHeight
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
      subWorks {
        ...SubWorkFields
      }
      nextWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
      }
      previousWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
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
